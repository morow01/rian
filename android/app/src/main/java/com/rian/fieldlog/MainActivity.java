package com.rian.fieldlog;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {

    private ValueCallback<Uri[]> mFilePathCallback;
    private PermissionRequest mPendingPermissionRequest;
    private String mPendingGeoOrigin;
    private GeolocationPermissions.Callback mPendingGeoCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 100;
    private static final int AUDIO_PERMISSION_REQUEST_CODE = 101;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 102;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ensureAudioPermission();

        // Modern back handling (Android 13+ / API 33+)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = getBridge().getWebView();
                if (wv != null) {
                    wv.evaluateJavascript(
                        "if(typeof _handleBackButton==='function'){_handleBackButton();}",
                        null
                    );
                }
            }
        });

        WebView wv = getBridge().getWebView();
        if (wv != null) {
            // Allow audio/video playback without a user gesture (needed for
            // Gemini TTS which plays audio after async fetch — the original
            // tap context is lost by the time the blob is ready).
            wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
            // Needed for the Routines map's "show my location" button (navigator.geolocation
            // via Leaflet's map.locate()) — defaults to true but set explicitly since this is
            // easy to silently lose track of.
            wv.getSettings().setGeolocationEnabled(true);

            // Expose native exit to JS — Capacitor App plugin doesn't work with remote URLs
            wv.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void exitApp() {
                    runOnUiThread(() -> finishAffinity());
                }
                // Download a file attachment and open it directly in the associated
                // app (Excel / Word / PDF viewer) instead of the browser.
                @JavascriptInterface
                public void openFile(final String url, final String name) {
                    runOnUiThread(() -> downloadAndOpen(url, name));
                }
            }, "RianNative");

            // Grant WebView permission requests (microphone, camera) —
            // required when loading from a remote URL (GitHub Pages).
            // onShowFileChooser enables <input type="file"> in the WebView.
            wv.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        if (hasAudioPermission()) {
                            request.grant(request.getResources());
                        } else {
                            mPendingPermissionRequest = request;
                            ensureAudioPermission();
                        }
                    });
                }

                // Grant WebView geolocation requests (Routines map "show my location").
                // Separate callback from onPermissionRequest above — geolocation isn't
                // one of PermissionRequest's resource types, WebView asks for it through
                // this dedicated method instead. Without this override the WebView's
                // default behavior denies it, so navigator.geolocation silently fails
                // (map.locate() never shows the location dot) even with the manifest
                // permission declared and granted at the OS level.
                @Override
                public void onGeolocationPermissionsShowPrompt(String origin,
                        GeolocationPermissions.Callback callback) {
                    if (hasLocationPermission()) {
                        callback.invoke(origin, true, false);
                    } else {
                        mPendingGeoOrigin = origin;
                        mPendingGeoCallback = callback;
                        ensureLocationPermission();
                    }
                }

                @Override
                @SuppressWarnings("deprecation")
                public boolean onShowFileChooser(WebView webView,
                        ValueCallback<Uri[]> filePathCallback,
                        FileChooserParams fileChooserParams) {
                    if (mFilePathCallback != null) {
                        mFilePathCallback.onReceiveValue(null);
                    }
                    mFilePathCallback = filePathCallback;
                    Intent intent = fileChooserParams.createIntent();
                    try {
                        startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                    } catch (Exception e) {
                        mFilePathCallback = null;
                        return false;
                    }
                    return true;
                }
            });
        }
    }

    private void ensureAudioPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        if (!hasAudioPermission()) {
            ActivityCompat.requestPermissions(
                this,
                new String[] { Manifest.permission.RECORD_AUDIO },
                AUDIO_PERMISSION_REQUEST_CODE
            );
        }
    }

    private boolean hasAudioPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                || ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void ensureLocationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        if (!hasLocationPermission()) {
            ActivityCompat.requestPermissions(
                this,
                new String[] { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION },
                LOCATION_PERMISSION_REQUEST_CODE
            );
        }
    }

    private boolean hasLocationPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
    }

    // Guess a MIME type from a file name's extension.
    private String guessMime(String name) {
        if (name == null) return null;
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) return null;
        String ext = name.substring(dot + 1).toLowerCase();
        String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
        if (mime != null) return mime;
        // Fallbacks for common office types not always in the map
        switch (ext) {
            case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "xls":  return "application/vnd.ms-excel";
            case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "doc":  return "application/msword";
            case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "csv":  return "text/csv";
            case "pdf":  return "application/pdf";
            default:     return null;
        }
    }

    // Download a file via DownloadManager, then open it in the associated app.
    private void downloadAndOpen(String url, String name) {
        try {
            String fileName = (name == null || name.trim().isEmpty()) ? "attachment" : name.trim();
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            final String finalName = fileName;
            final String mime = guessMime(fileName);

            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setTitle(finalName);
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, finalName);
            if (mime != null) req.setMimeType(mime);

            final DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm == null) { Toast.makeText(this, "Download unavailable", Toast.LENGTH_SHORT).show(); return; }
            final long downloadId = dm.enqueue(req);

            BroadcastReceiver onComplete = new BroadcastReceiver() {
                @Override
                public void onReceive(Context ctx, Intent intent) {
                    long got = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (got != downloadId) return;
                    try { ctx.unregisterReceiver(this); } catch (Exception ignored) {}
                    try {
                        File file = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), finalName);
                        Uri uri = FileProvider.getUriForFile(
                            MainActivity.this, getPackageName() + ".fileprovider", file);
                        Intent view = new Intent(Intent.ACTION_VIEW);
                        view.setDataAndType(uri, mime != null ? mime : "*/*");
                        view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(view);
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(MainActivity.this, "No app can open this file type", Toast.LENGTH_LONG).show();
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Couldn't open file", Toast.LENGTH_SHORT).show();
                    }
                }
            };
            IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(onComplete, filter, Context.RECEIVER_EXPORTED);
            } else {
                registerReceiver(onComplete, filter);
            }
        } catch (Exception e) {
            Toast.makeText(this, "Download failed", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == AUDIO_PERMISSION_REQUEST_CODE && mPendingPermissionRequest != null) {
            PermissionRequest request = mPendingPermissionRequest;
            mPendingPermissionRequest = null;
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                request.grant(request.getResources());
            } else {
                request.deny();
            }
        }
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE && mPendingGeoCallback != null) {
            GeolocationPermissions.Callback callback = mPendingGeoCallback;
            String origin = mPendingGeoOrigin;
            mPendingGeoCallback = null;
            mPendingGeoOrigin = null;
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            callback.invoke(origin, granted, false);
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                // Fallback: confirmed via logcat on a real device — the system Photo Picker's
                // multi-select "Google Photos" UI (Android 13+) returns its result via
                // ClipData, and the deprecated parseResult() helper came back null/empty for
                // it even though the user genuinely picked a photo (Intent itself definitely
                // carried it — resultCode=-1/OK, clipData present). Read ClipData / getData()
                // directly instead of relying solely on parseResult() in that case.
                if (results == null || results.length == 0) {
                    if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        Uri[] manual = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            manual[i] = data.getClipData().getItemAt(i).getUri();
                        }
                        results = manual;
                    } else if (data.getData() != null) {
                        results = new Uri[] { data.getData() };
                    }
                }
            }
            if (mFilePathCallback != null) {
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }
}
