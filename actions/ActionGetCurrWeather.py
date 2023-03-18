# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions

# This is a simple example for a custom action which utters "Hello World!"
import json
from pathlib import Path
from typing import Any, Text, Dict, List
import pandas as pd
import numpy as np

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests


class ActionCheckExistence(Action):
    weather_cond = pd.read_csv(Path("data/weather_codes.txt"), sep="\t")

    def name(self) -> Text:
        return "action_get_curr_weather"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        try:
            response = requests.get("http://api.worldweatheronline.com/premium/v1/weather.ashx?key=240bdd0c8b944257bc4184710231703&q=Barcelona&format=json").json()

            weather_code = response["data"]["current_condition"][0]["weatherCode"]
            temperature = response["data"]["current_condition"][0]["temp_C"]

            weather_text = self.weather_cond.loc[self.weather_cond['WeatherCode'] == str(weather_code)].iloc[0]["Condition"]

            dispatcher.utter_message("Currently the weather outside is " + weather_text + " with a temperature of " + temperature + " degree celsius.")

        except:
            dispatcher.utter_message("Unfortunately I cannot check the weather for you at the moment. Sorry!")

        return []


