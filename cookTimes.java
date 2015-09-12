package com.mfwiesman.beeroclock;

public class cookTimes {
    private String food_type;
    private long time_to_cook;

    public cookTimes(String f, long t)
    {
        food_type = f;
        time_to_cook = t;
    }


    public String getFood_type() {
        return food_type;
    }

    public long getTime_to_cook() {
        return time_to_cook;
    }

    public void setFood_type(String food_type) {
        this.food_type = food_type;
    }

    public void setTime_to_cook(long time_to_cook) {
        this.time_to_cook = time_to_cook;
    }
}
