package com.mfwiesman.beeroclock;

import java.util.Map;

public class BStorage {
    private static Map<String, Long> beers = null;

    private static long currentTime = 0;
    private static String currentBeer = null;

    private static double final_beers = 0;

    public static Map<String, Long> getBeers() {
        return beers;
    }

    public static long getCurrentTime() {
        return currentTime;
    }

    public static String getCurrentBeer() {
        return currentBeer;
    }

    public static void setBeers(Map<String, Long> beers) {
        BStorage.beers = beers;
    }

    public static void setCurrentTime(long currentTime) {
        BStorage.currentTime = currentTime;
    }

    public static void setCurrentBeer(String currentBeer) {
        BStorage.currentBeer = currentBeer;
    }

    public static void setFinal_beers(double final_beers) {
        BStorage.final_beers = final_beers;
    }

    public static double getFinal_beers() {
        return final_beers;
    }
}
