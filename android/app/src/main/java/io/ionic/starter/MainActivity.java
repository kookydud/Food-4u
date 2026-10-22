package io.ionic.starter;

import android.os.Bundle;
import android.view.View;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Android 12+ draws a "stretch" effect on the whole WebView when you scroll past the
        // top or bottom of a page, which stretched the top bar and bottom nav too. CSS
        // overscroll-behavior cannot switch off this native effect, so turn it off here.
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
    }
}
