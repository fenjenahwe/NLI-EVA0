from pathlib import Path
from typing import Any, Text, Dict, List
import pandas as pd
import numpy as np

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionDegreeInfo(Action):
    bsc_knowledge = pd.read_csv(Path("data/bsc_degrees.csv", encoding="ISO-8859-1"))
    msc_knowledge = pd.read_csv(Path("data/msc_degrees.csv", encoding="ISO-8859-1"))

    def name(self) -> Text:
        return "action_degree_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        print(tracker.latest_message)
        names = []
        bsc = False
        msc = False
        for entity in tracker.latest_message["entities"]:
            print(entity)
            if entity["entity"] == "msc_name":
                names.append(entity["value"])
                msc = True
                print("msc is true")
            if entity["entity"] == "bsc_name":
                names.append(entity["value"])
                bsc = True
                print("bsc is true")
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

        # name = name.replace("lab", "").replace("group", "").strip()
        if names:
            bsc_entries = self.bsc_knowledge[self.bsc_knowledge['low_name'].str.contains(names[0].lower())]
            msc_entries = self.msc_knowledge[self.msc_knowledge['low_name'].str.contains(names[0].lower())]

            if (len(bsc_entries) == 1 and len(msc_entries) == 1) or len(bsc_entries) == 1 or len(msc_entries) == 1:
                print(tracker.latest_message["text"])
                if bsc is True and msc is True:
                    if "bachelor" in tracker.latest_message["text"] or "bsc" in tracker.latest_message["text"] or "undergrad" in tracker.latest_message["text"]:
                        msc = False
                    if "master" in tracker.latest_message["text"] or "msc" in tracker.latest_message["text"]:
                        bsc = False
                if bsc is True and msc is False:
                    if degree_intent == 1:
                        dispatcher.utter_message(
                            text=f"{bsc_entries.iloc[0]['description']} For more information, you can visit the group's website: {bsc_entries.iloc[0]['degree_link']}. You can ask me about the duration and the credits of a program.")
                        degree_intent = 0
                    if credit_intent == 1:
                        dispatcher.utter_message(
                            text=f"The {bsc_entries.iloc[0]['degrees']} consists in {bsc_entries.iloc[0]['teaching_load']} credits. You can ask me about the duration of a program.")
                        credit_intent = 0
                    if duration_intent == 1:
                        dispatcher.utter_message(
                            text=f"The {bsc_entries.iloc[0]['degrees']} is a {bsc_entries.iloc[0]['duration']} program. You can ask me about the credits of a program.")
                        duration_intent = 0
                if msc is True and bsc is False:
                    if degree_intent == 1:
                        dispatcher.utter_message(
                            text=f"{msc_entries.iloc[0]['description']} For more information, you can visit the group's website: {msc_entries.iloc[0]['degree_link']}. You can ask me about the duration and the credits of a program.")
                        degree_intent = 0
                    if credit_intent == 1:
                        dispatcher.utter_message(
                            text=f"The {msc_entries.iloc[0]['degrees']} consists in {msc_entries.iloc[0]['teaching_load']} credits. You can ask me about the duration of a program.")
                        credit_intent = 0
                    if duration_intent == 1:
                        dispatcher.utter_message(
                            text=f"The {msc_entries.iloc[0]['degrees']} is a {msc_entries.iloc[0]['duration']} program. You can ask me about the credits of a program.")
                        duration_intent = 0
            else:
                dispatcher.utter_message(text=f"I do not recognize {names[0]}. Did you spell that correctly?")

        else:
            dispatcher.utter_message(text=f"I'm sorry, there is no such degree offered here.")

        return []

