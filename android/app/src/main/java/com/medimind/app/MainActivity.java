package com.medimind.app;

import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // After the bridge initialises, lock the WebView text zoom to 100%
        // so the app looks identical regardless of the user's system font-size setting.
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setTextZoom(100);                 // ignore system font scale
            settings.setSupportZoom(false);             // disable pinch-zoom
            settings.setBuiltInZoomControls(false);     // hide zoom buttons
            settings.setDisplayZoomControls(false);
            settings.setLoadWithOverviewMode(true);     // fit content to screen width
            settings.setUseWideViewPort(true);
        }
    }

    /**
     * Prevent system font-size changes from scaling our layout/dp values.
     */
    @Override
    public Resources getResources() {
        Resources res = super.getResources();
        Configuration config = new Configuration(res.getConfiguration());
        config.fontScale = 1.0f;
        return createConfigurationContext(config).getResources();
    }
}
