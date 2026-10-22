package ch.chrisbaumann.sudoku;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Draw behind the system bars (always the case from Android 15 with
        // target SDK 35); the Capacitor SystemBars plugin pads the web view by
        // the insets of the bars and the display cutout.
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
    }
}
