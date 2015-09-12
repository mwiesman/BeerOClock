package com.mfwiesman.beeroclock;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

public class FoodSelector extends AppCompatActivity {

    CookTimes burger_cook_time = new CookTimes("Hamburger", 3);

    //make an enum of all the food types in the list - instead of using string
    // or an array of food types and their cooking time per oz
    // could use a map that has a string as it's key value is time per oz
    public double foodToTime(CookTimes foodType, int oz)
    {

        // take avg cooking time per oz for a food type * oz
        double cooking_time_oz = foodType.getTime_to_cook() * oz;
        // take above value divide by time per 1 beer
        return (double) (cooking_time_oz / BStorage.getCurrentTime());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_food_selector);
        final EditText num_ounces_text = (EditText) findViewById(R.id.num_ounces_edit_text);
        Button cooking_continue = (Button) findViewById(R.id.continue_cook_button);
        cooking_continue.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                String ounces_entered = num_ounces_text.getText().toString();
                int num_ounces_int = Integer.parseInt(ounces_entered);
                BStorage.setFinal_beers(foodToTime(burger_cook_time, num_ounces_int));
                Intent x = new Intent(FoodSelector.this, BeerTimer.class);
                startActivity(x);
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_food_selector, menu);
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
