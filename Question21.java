package com.remington.beeroclock;



import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class Question21 extends AppCompatActivity {

    public void sendNoMessage(int i) {
        if (this.i == 0) {
            Toast.makeText(Question21.this, "You Sure", Toast.LENGTH_SHORT).show();
            ++this.i;
        }
        else if (i == 1)
        {
            Toast.makeText(Question21.this,
                    "Just click yes, man. You can use root beer or something",
                    Toast.LENGTH_LONG).show();
            ++this.i;
        }
        else
        {
            Toast.makeText(Question21.this, "Ugh Fine", Toast.LENGTH_SHORT).show();
            this.i = 0;
            // make app close
            System.exit(0);
        }
    }

    private int i = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_question21);

        Button yes = (Button) findViewById(R.id.yes_button);
        yes.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent x = new Intent(Question21.this, TimeTrial.class);
                startActivity(x);
            }
        });

        Button no = (Button) findViewById(R.id.no_button);
        no.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendNoMessage(i);
            }
        });

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_question21, menu);
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
