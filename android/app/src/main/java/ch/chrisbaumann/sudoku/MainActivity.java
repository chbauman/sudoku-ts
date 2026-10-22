package ch.chrisbaumann.sudoku;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Draw behind the system bars (always the case from Android 15 with
        // target SDK 35); the Capacitor SystemBars plugin pads the web view by
        // the insets of the bars and the display cutout.
        // After super.onCreate: BridgeActivity switches to the theme without an
        // action bar there, and the window features cannot change once the
        // window is set up (enable() before it showed a native action bar).
        EdgeToEdge.enable(this);
    }
}
