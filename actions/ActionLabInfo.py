from pathlib import Path
from typing import Any, Text, Dict, List
import pandas as pd
import numpy as np

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionLabInfo(Action):
    knowledge = pd.read_csv(Path("data/labs.csv", encoding="ISO-8859-1"))

    def name(self) -> Text:
        return "action_lab_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        names = []
        print(tracker.latest_message)
        for entity in tracker.latest_message["entities"]:
            print(entity)
            if entity["entity"] == "group_name":
                names.append(entity["value"])
            if entity["entity"] == "group_name" and not entity["value"].lower() in "\t".join(names).lower():
                names.append(entity["value"])
        description_intent = 0
        number_intent = 0
        head_intent = 0
        affirm_intent = 0
        if tracker.latest_message["intent"]["name"] == "find_group_info":
            description_intent = 1
        if tracker.latest_message["intent"]["name"] == "find_group_number":
            number_intent = 1
        if tracker.latest_message["intent"]["name"] == "find_group_head":
            head_intent = 1
        if tracker.latest_message["intent"]["name"] == "affirm":
            affirm_intent = 1

        if len(names) == 0 and affirm_intent == 0:
            dispatcher.utter_message("Unfortunately I couldn't understand the lab name you are giving me.")

        # if affirm_intent == 1:

        for name in names:
            name = name.replace("lab", "").replace("group", "").strip()
            entries = self.knowledge[self.knowledge['low_name'].str.contains(name.lower())]

            if len(entries) == 1:

                if description_intent == 1:
                    dispatcher.utter_message(
                        text=f"{entries.iloc[0]['group_description']} For more information, you can visit the group's website: {entries.iloc[0]['group_link']}.")
                    description_intent = 0
                if number_intent == 1:
                    dispatcher.utter_message(
                        text=f"The {entries.iloc[0]['groups']} has {entries.iloc[0]['numbers']} researchers as part of their staff.")
                    number_intent = 0
                if head_intent == 1:
                    dispatcher.utter_message(
                        text=f"The {entries.iloc[0]['groups']} is headed by {entries.iloc[0]['group_head']}. You can ask me more about the director.")
                    head_intent = 0
            else:
                dispatcher.utter_message(text=f"I do not recognize {name}. Did you spell that correctly?")

        return []

