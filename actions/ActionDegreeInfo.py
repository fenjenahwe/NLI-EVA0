from pathlib import Path
from typing import Any, Text, Dict, List
import pandas as pd
import numpy as np

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionDegreeInfo(Action):
    knowledge = pd.read_csv(Path("data/degrees.csv", encoding="ISO-8859-1"))

    def name(self) -> Text:
        return "action_degree_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        print(tracker.latest_message)
        names = []
        for entity in tracker.latest_message["entities"]:
            print(entity)
            if entity["entity"] == "msc_name" or entity["entity"] == "bsc_name":
                names.append(entity["value"])
            if (entity["entity"] == "msc_name" or entity["entity"] == "msc_name") and not entity["value"].lower() in "\t".join(names).lower():
                names.append(entity["value"])
        degree_intent = 0
        credit_intent = 0
        duration_intent = 0
        if tracker.latest_message["intent"]["name"] == "find_degree_info":
            degree_intent = 1
        if tracker.latest_message["intent"]["name"] == "find_credit_info":
            credit_intent = 1
        if tracker.latest_message["intent"]["name"] == "find_duration_info":
            duration_intent = 1

        print("names", names)
        # if len(names) == 0 and affirm_intent == 0:
        #     dispatcher.utter_message("Unfortunately I couldn't understand the lab name you are giving me.")

        # if affirm_intent == 1:

        for name in names:
            name = name.replace("lab", "").replace("group", "").strip()
            entries = self.knowledge[self.knowledge['low_name'].str.contains(name.lower())]

            if len(entries) == 1:

                if degree_intent == 1:
                    dispatcher.utter_message(
                        text=f"{entries.iloc[0]['description']} For more information, you can visit the group's website: {entries.iloc[0]['degree_link']}. You can ask me about the duration and the credits of a program.")
                    degree_intent = 0
                if credit_intent == 1:
                    dispatcher.utter_message(
                        text=f"The {entries.iloc[0]['degrees']} consists in {entries.iloc[0]['teaching_load']} credits. You can ask me about the duration of a program.")
                    credit_intent = 0
                if duration_intent == 1:
                    dispatcher.utter_message(
                        text=f"The {entries.iloc[0]['degrees']} is a {entries.iloc[0]['duration']} program. You can ask me about the credits of a program.")
                    duration_intent = 0

            else:
                dispatcher.utter_message(text=f"I do not recognize {name}. Did you spell that correctly?")

        return []

