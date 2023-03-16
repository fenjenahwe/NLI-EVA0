from pathlib import Path
from typing import Any, Text, Dict, List
import pandas as pd
import numpy as np

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionLabInfo(Action):
    knowledge = pd.read_csv(Path("data/labs.csv"))

    def name(self) -> Text:
        return "action_lab_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        names = []
        for entity in tracker.latest_message["entities"]:
            print(entity)
            if entity["entity"] == "group_name":
                names.append(entity["value"])
            if entity["entity"] == "group_name" and not entity["value"].lower() in "\t".join(names).lower():
                names.append(entity["value"])


        if len(names) == 0:
            dispatcher.utter_message("Unfortunately I couldn't understand the lab name you are giving me.")
        for name in names:

            name= name.replace("lab", "").replace("group", "").strip()
            entries = self.knowledge[self.knowledge['low_name'].str.contains(name.lower())]

            if len(entries) == 1:

                dispatcher.utter_message(
                    text=f"{entries.iloc[0]['groups']} group has {entries.iloc[0]['numbers']} researchers as part of their staff.")
            else:
                dispatcher.utter_message(text=f"I do not recognize {name}. Did you spell that correctly?")

        return []

