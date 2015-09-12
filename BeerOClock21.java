package com.mfwiesman.beeroclock;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class BeerOClock21 extends AppCompatActivity {
    public final static String EXTRA_MESSAGE = "com.mfwiesman.beeroclock.MESSAGE";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = getIntent();

        Button yes21 = (Button) findViewById(R.id.yesButton);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_beer_oclock21, menu);
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

    /** Called when the user clicks the Send button */
    public void sendYesMessage(View view) {
        // Do something in response to button
        Intent intent = new Intent(this, TimeBeer.class);
        //String message = editText.getText().toString();
        //intent.putExtra(EXTRA_MESSAGE, message);
        startActivity(intent);
    }

    public void sendNoMessage(View view) {
        int i = 0;
        if (i == 0) {
            Toast.makeText(BeerOClock21.this, "You Sure", Toast.LENGTH_SHORT).show();
            ++i;
        }
        else if (i == 1)
        {
            Toast.makeText(BeerOClock21.this,
                    "Just click yes, man. You can use root beer or something",
                    Toast.LENGTH_LONG).show();
            ++i;
        }
        else
        {
            Toast.makeText(BeerOClock21.this, "Ugh Fine", Toast.LENGTH_SHORT).show();
            i = 0;
            // make app close
            System.exit(0);
        }
    }
}
