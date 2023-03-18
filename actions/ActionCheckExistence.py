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
import Levenshtein as lv

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet


def levenshtein(array_to_search, dist, string):
    # return list(map(lambda x: x<dist, map(lambda x: lv.distance(string, x), array_to_search)))
    return [x for x in array_to_search if lv.distance(string, x) < dist]


class ActionCheckExistence(Action):
    all_teachers = pd.read_csv(Path("data/processed_teachers.csv"))
    all_groups = Path("data/groups.txt").read_text().split("\n")

    def name(self) -> Text:
        return "action_check_existence"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        print(tracker.latest_message)

        names = []
        groups = []
        for entity in tracker.latest_message["entities"]:
            if entity["entity"] == "PERSON" and not entity["value"].lower() == "dtic":
                names.append(entity["value"])
                print(names)
            if entity["entity"] == "teacher_name" and len(names)==0:
                names.append(entity["value"])
                print(names)
            if entity["entity"] == "group_name":
                groups.append(entity["value"])
                print(groups)

        if len(names) == 0 and len(groups) == 0:
            dispatcher.utter_message("Unfortunately I couldn't understand the name of a professor nor a group.")
        
        if (len(groups) >= 1 and names[0].title() == "Can") or (len(groups) >= 1 and len(names) == 0):
            group_found = False
            groups[0] = groups[0].replace("lab", "").replace("group", "").strip()
            for group in self.all_groups:
                if groups[0].upper() in group.upper():
                    group_found = True
                    dispatcher.utter_message(text="The " + group + " is part of the DTIC department.")
            if not group_found:
                dispatcher.utter_message("I was not able to find a group for the search term " + groups[0] + ". Sorry for the inconvenience!")

        if len(names) >= 1:
            entries = self.all_teachers[self.all_teachers['Full name'].str.contains(names[0].title())]
 
            if len(names) == 1 and names[0].title() == "Can":
                dispatcher.utter_message(
                    text="Can you repeat that please?")
            
            if len(entries) == 0:
                all_teacher_names = self.all_teachers["Full name"].tolist() + self.all_teachers["First name"].tolist() + self.all_teachers["Surname 1"].tolist() + self.all_teachers["Surname 2"].tolist()
                all_teacher_names = [x for x in all_teacher_names if str(x) != 'nan']
                for i in range(0, 5):
                    fuzzy_names = levenshtein(all_teacher_names, i, names[0].title())
                    if len(fuzzy_names) > 0:
                        entries = self.all_teachers[self.all_teachers['Full name'].str.contains('|'.join(fuzzy_names))]
                        break

            if len(entries) == 1:
                dispatcher.utter_message(
                    text=f"{entries.iloc[0]['Full name']} is part of the DTIC teaching staff and works in the {entries.iloc[0]['Group belonging']}, office number {entries.iloc[0]['Office number']}.")
                return [SlotSet(key="slot_group", value=entries.iloc[0]['Group belonging'])]
            elif len(entries) > 1:
                buttons = []
                for i in range(len(entries)):
                    buttons.append({"title": entries.iloc[i]['Full name']})
                dispatcher.utter_message(
                    text="I found multiple teachers matching this question. Please give me the full name of the person you are looking for :)\n" + "\n".join(
                        entries['Full name'].values))
            else:
                dispatcher.utter_message(text=f"I do not recognize {names[0]}. Did you spell that correctly?")


        return [SlotSet(key="slot_group", value=None)]
