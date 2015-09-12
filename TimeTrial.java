package com.remington.beeroclock;

import android.content.Context;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v7.app.AppCompatActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Chronometer;
import android.widget.Toast;
import android.content.Intent;

public class TimeTrial extends AppCompatActivity {

    public TimeTrial() {}

    private Context mContext;

    public void startChronometer(View view) {
        ((Chronometer) findViewById(R.id.beer_chronometer)).start();
    }

    public void stopChronometer(View view) {
        ((Chronometer) findViewById(R.id.beer_chronometer)).stop();
    }


    private int i = 0;
    private Button timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_time_trial);

        timer = (Button) findViewById(R.id.timer_button);
        timer.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // need a counter so if they click again should stop
                // change text as well
                if (i == 0) {
                    startChronometer(v);
                    timer.setText("Stop Timer");
                    ++i;
                } else if (i == 1) {
                    stopChronometer(v);
                    timer.setText("Save Time");
                    long elapsedMillis = SystemClock.elapsedRealtime()
                            - ((Chronometer) findViewById(R.id.beer_chronometer)).getBase() - 1000;
                    Toast.makeText(TimeTrial.this, "Elapsed seconds: " + elapsedMillis / 1000 + "."
                                    + elapsedMillis % 1000, Toast.LENGTH_SHORT).show();
                    ++i;
                }
                else if (i == 2) {
                    Intent x = new Intent(TimeTrial.this, TimeSave.class);
                    startActivity(x);
                }

            }

        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_time_trial, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
