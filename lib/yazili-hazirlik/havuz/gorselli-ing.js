// İngilizce: görselli sorular (saat, program/menü tabloları, işaret kartları, grafik).
import { S, svg, tablo, Q } from "./gorselli-yardim.js";
const saat = (s, d) => svg(S.saat({ s, d }), "40%");
const kart = (baslik, satirlar, renk) => svg(S.kart({ baslik, satirlar, renk }), "64%");
export default {
  "4": {
    "1.1": [
      Q("What time is it?", "It's three o'clock.", ["It's six o'clock.", "It's nine o'clock.", "It's twelve o'clock."], "Hour hand on 3, minute hand on 12: three o'clock.", saat(3, 0)),
      Q("Look at the table. Which animal has two legs?", "Bird", ["Cat", "Dog", "Fish"], "Only the bird has two legs in the table.", tablo(["Animal", "Legs"], [["Cat", "4"], ["Bird", "2"], ["Dog", "4"], ["Fish", "0"]], "Animals")),
    ],
    "1.2": [
      Q("What is Ali's favourite colour?", "Blue", ["Red", "Green", "Yellow"], "The card says: favourite colour is blue.", kart("ALI", ["Age: 9", "Favourite colour: blue", "Favourite food: pizza"], "#2c6fbb")),
      Q("Look at the table. How many apples are there?", "Five", ["Three", "Four", "Six"], "The table shows 5 apples.", tablo(["Fruit", "Number"], [["Apple", "5"], ["Banana", "3"], ["Orange", "4"]], "Fruit basket")),
    ],
    "1.3": [
      Q("What time is it?", "It's seven o'clock.", ["It's five o'clock.", "It's eight o'clock.", "It's eleven o'clock."], "Hour hand on 7, minute hand on 12.", saat(7, 0)),
      Q("Look at the card. What is her name?", "Zeynep", ["Elif", "Defne", "Ayşe"], "The name on the card is Zeynep.", kart("NAME CARD", ["Name: Zeynep", "Age: 10", "From: Turkey"], "#c0504d")),
    ],
    "2.1": [
      Q("Look at the table. What does Mia eat for breakfast?", "Eggs", ["Fish", "Rice", "Soup"], "The table shows Mia eats eggs for breakfast.", tablo(["Name", "Breakfast"], [["Mia", "Eggs"], ["Tom", "Cheese"], ["Ece", "Olives"]], "Breakfast")),
      Q("What time is it?", "It's half past two.", ["It's two o'clock.", "It's half past three.", "It's a quarter past two."], "Hour hand between 2 and 3, minute hand on 6: half past two.", saat(2, 30), {u:"Jobs", k:"Jobs"}),
    ],
    "2.2": [
      Q("Look at the weather table. What is the weather like on Monday?", "Sunny", ["Rainy", "Snowy", "Windy"], "The table says Monday: sunny.", tablo(["Day", "Weather"], [["Monday", "Sunny"], ["Tuesday", "Rainy"], ["Wednesday", "Cloudy"]], "Weather this week"), {u:"My Clothes", k:"My Clothes"}),
      Q("Look at the card. Where is the party?", "At the park", ["At school", "At home", "At the cinema"], "The invitation says: at the park.", kart("PARTY", ["Birthday party", "Saturday, 3 pm", "At the park"], "#2e8b57")),
    ],
    "2.3": [
      Q("Look at the table. Who likes pizza?", "Deniz", ["Can", "Ela", "Ali"], "The table shows Deniz likes pizza.", tablo(["Name", "Favourite food"], [["Deniz", "Pizza"], ["Can", "Soup"], ["Ela", "Salad"]], "Favourite food")),
      Q("What time is it?", "It's ten o'clock.", ["It's two o'clock.", "It's eight o'clock.", "It's twelve o'clock."], "Hour hand on 10, minute hand on 12.", saat(10, 0)),
    ],
  },
  "5": {
    "1.1": [
      Q("Look at the timetable. What lesson is there on Monday at 9:00?", "Maths", ["Science", "Music", "Art"], "The timetable shows Maths on Monday at 9:00.", tablo(["Day", "9:00", "10:00"], [["Monday", "Maths", "Science"], ["Tuesday", "Music", "Art"]], "School timetable"), {u:"Theme 1: School Life", k:"Theme 1: School Life"}),
      Q("What time is it?", "It's a quarter past four.", ["It's a quarter to four.", "It's half past four.", "It's four o'clock."], "Minute hand on 3 means quarter past.", saat(4, 15)),
    ],
    "1.2": [
      Q("Look at the table. Who gets up the earliest?", "Burak", ["Mina", "Cem", "They get up at the same time."], "Burak gets up at 6:30, the earliest.", tablo(["Name", "Gets up"], [["Mina", "7:30"], ["Burak", "6:30"], ["Cem", "7:00"]], "Morning routine")),
      Q("What time is it?", "It's a quarter to nine.", ["It's a quarter past nine.", "It's half past eight.", "It's nine o'clock."], "Minute hand on 9 means quarter to the next hour.", saat(8, 45)),
    ],
    "1.3": [
      Q("Look at the table. Which sport does Ece do on Friday?", "Swimming", ["Tennis", "Basketball", "Volleyball"], "Friday: swimming.", tablo(["Day", "Sport"], [["Monday", "Tennis"], ["Wednesday", "Basketball"], ["Friday", "Swimming"]], "Ece's sports")),
      Q("Look at the card. How much is the ticket?", "20 liras", ["10 liras", "15 liras", "25 liras"], "The card says ticket: 20 liras.", kart("CONCERT", ["Saturday, 7 pm", "City Hall", "Ticket: 20 liras"], "#9B6BB0")),
    ],
    "2.1": [
      Q("Look at the menu. How much is the soup?", "10 liras", ["5 liras", "15 liras", "20 liras"], "The menu shows soup: 10 liras.", tablo(["Food", "Price"], [["Soup", "10 liras"], ["Salad", "15 liras"], ["Pizza", "30 liras"]], "Menu")),
      Q("What time is it?", "It's five past six.", ["It's ten past six.", "It's five to six.", "It's six o'clock."], "Minute hand on 1 means five past.", saat(6, 5)),
    ],
    "2.2": [
      Q("Look at the table. Which city is the hottest?", "Antalya", ["Erzurum", "Ankara", "They are all the same."], "Antalya has 35 degrees, the highest.", tablo(["City", "Temperature"], [["Antalya", "35°C"], ["Ankara", "28°C"], ["Erzurum", "12°C"]], "Temperatures")),
      Q("Look at the card. When does the film start?", "At 6 pm", ["At 4 pm", "At 8 pm", "At 10 pm"], "The card says the film starts at 6 pm.", kart("CINEMA", ["Film: Space Trip", "Today, 6 pm", "Hall 2"], "#c0504d")),
    ],
    "2.3": [
      Q("Look at the table. Where is Deniz's holiday?", "In Izmir", ["In Rize", "In Van", "In Edirne"], "The table shows Deniz goes to Izmir.", tablo(["Name", "Holiday place"], [["Deniz", "Izmir"], ["Ada", "Rize"], ["Can", "Edirne"]], "Holiday plans")),
      Q("What time is it?", "It's twenty past one.", ["It's twenty to one.", "It's half past one.", "It's ten past one."], "Minute hand on 4 means twenty past.", saat(1, 20)),
    ],
  },
  "6": {
    "1.1": [
      Q("Look at the table. Who is the tallest?", "Ben", ["Ali", "Can", "Eda"], "Ben is 165 cm, the tallest.", tablo(["Name", "Height"], [["Ali", "150 cm"], ["Ben", "165 cm"], ["Can", "158 cm"], ["Eda", "140 cm"]], "Heights")),
      Q("Look at the table. What does Lara do at 7:00?", "She has breakfast.", ["She goes to bed.", "She does homework.", "She plays tennis."], "Lara has breakfast at 7:00.", tablo(["Time", "Lara's day"], [["7:00", "Has breakfast"], ["8:00", "Goes to school"], ["16:00", "Plays tennis"]], "Lara's day")),
    ],
    "1.2": [
      Q("Look at the table. How often does Emre play chess?", "Every day", ["Never", "Once a week", "Twice a month"], "The table shows Emre plays chess every day.", tablo(["Activity", "How often?"], [["Play chess", "Every day"], ["Go swimming", "Once a week"], ["Visit grandma", "Twice a month"]], "Emre's activities")),
      Q("What time is it?", "It's twenty-five past three.", ["It's twenty-five to three.", "It's twenty past three.", "It's half past three."], "Minute hand on 5 means 25 minutes past.", saat(3, 25)),
    ],
    "1.3": [
      Q("Look at the table. Which place is next to the bank?", "The post office", ["The school", "The hospital", "The market"], "The post office is next to the bank.", tablo(["Place", "Position"], [["Bank", "Next to the post office"], ["School", "Opposite the park"], ["Market", "Behind the hospital"]], "Town map notes")),
      Q("Look at the table. What is on the second floor?", "The toy shop", ["The bakery", "The cinema", "The bank"], "The second floor has the toy shop.", tablo(["Floor", "Shop"], [["1st floor", "Bakery"], ["2nd floor", "Toy shop"], ["3rd floor", "Cinema"]], "Shopping centre"), {u:"Theme 4: Family Life", k:"Theme 4: Family Life"}),
    ],
    "2.1": [
      Q("Look at the table. What was the weather like yesterday?", "It was rainy.", ["It was sunny.", "It was snowy.", "It was windy."], "Yesterday: rainy.", tablo(["Day", "Weather"], [["Yesterday", "Rainy"], ["Today", "Sunny"], ["Tomorrow", "Cloudy"]], "Weather")),
      Q("Look at the card. When does the museum close?", "At 5 pm", ["At 9 am", "At 12 pm", "At 8 pm"], "The sign says the museum closes at 5 pm.", kart("MUSEUM", ["Open: 9 am", "Close: 5 pm", "Closed on Mondays"], "#2e8b57")),
    ],
    "2.2": [
      Q("Look at the table. Which animal is the fastest?", "Cheetah", ["Horse", "Rabbit", "Turtle"], "Cheetah: 110 km/h, the highest speed.", tablo(["Animal", "Speed"], [["Cheetah", "110 km/h"], ["Horse", "70 km/h"], ["Rabbit", "55 km/h"], ["Turtle", "1 km/h"]], "Animal speeds")),
      Q("Look at the table. What did Ayla do last Sunday?", "She visited her aunt.", ["She went to the cinema.", "She played football.", "She stayed at school."], "Sunday: visited her aunt.", tablo(["Day", "Ayla's activity"], [["Saturday", "Went shopping"], ["Sunday", "Visited her aunt"]], "Ayla's weekend")),
    ],
    "2.3": [
      Q("Look at the table. Which transport is the cheapest?", "Bus", ["Taxi", "Plane", "Train"], "The bus costs 10 liras, the least.", tablo(["Transport", "Price"], [["Bus", "10 liras"], ["Train", "25 liras"], ["Taxi", "60 liras"], ["Plane", "300 liras"]], "Ticket prices")),
      Q("What time is it?", "It's ten to five.", ["It's ten past five.", "It's ten to six.", "It's five to ten."], "Minute hand on 10 means ten to the next hour.", saat(4, 50)),
    ],
  },
  "7": {
    "1.1": [
      Q("Look at the table. Which sport is the most popular?", "Football", ["Basketball", "Tennis", "Swimming"], "Football has the highest number (12).", tablo(["Sport", "Students"], [["Football", "12"], ["Basketball", "8"], ["Tennis", "5"], ["Swimming", "7"]], "Class survey")),
      Q("Look at the table. Who is the youngest?", "Duru", ["Kaan", "Selin", "Mert"], "Duru is 11, the youngest.", tablo(["Name", "Age"], [["Kaan", "13"], ["Duru", "11"], ["Selin", "12"], ["Mert", "14"]], "Ages")),
    ],
    "1.2": [
      Q("Look at the table. What is Sara's job?", "Doctor", ["Teacher", "Pilot", "Chef"], "The table shows Sara is a doctor.", tablo(["Name", "Job"], [["Sara", "Doctor"], ["Tuna", "Pilot"], ["Ece", "Chef"]], "Jobs")),
      Q("Look at the table. Which month has the most rainy days?", "April", ["May", "June", "July"], "April has 12 rainy days, the highest.", tablo(["Month", "Rainy days"], [["April", "12"], ["May", "8"], ["June", "3"], ["July", "1"]], "Rainy days")),
    ],
    "1.3": [
      Q("Look at the menu. Which dessert is the cheapest?", "Ice cream", ["Cake", "Baklava", "Pudding"], "Ice cream costs 20 liras, the lowest.", tablo(["Dessert", "Price"], [["Cake", "45 liras"], ["Baklava", "60 liras"], ["Ice cream", "20 liras"], ["Pudding", "30 liras"]], "Dessert menu")),
      Q("Look at the card. How long is the trip?", "Two days", ["One day", "Four days", "One week"], "The card says: 2 days trip.", kart("TRIP TO BURSA", ["Duration: 2 days", "Leaving: Friday 8 am", "Price: 500 liras"], "#2c6fbb")),
    ],
    "2.1": [
      Q("Look at the table. Which phone is the most expensive?", "Phone C", ["Phone A", "Phone B", "They cost the same."], "Phone C is 9000 liras, the highest.", tablo(["Phone", "Price"], [["Phone A", "6000 liras"], ["Phone B", "7500 liras"], ["Phone C", "9000 liras"]], "Phone prices")),
      Q("Look at the table. What time does the train leave?", "At 14:30", ["At 13:30", "At 15:30", "At 16:30"], "The train leaves at 14:30.", tablo(["Train", "Leaves", "Arrives"], [["Ankara", "14:30", "17:00"]], "Train ticket")),
    ],
    "2.2": [
      Q("Look at the table. Which planet is the closest to the Sun?", "Mercury", ["Venus", "Earth", "Mars"], "Mercury is 58 million km away, the closest.", tablo(["Planet", "Distance from the Sun"], [["Mercury", "58 million km"], ["Venus", "108 million km"], ["Earth", "150 million km"], ["Mars", "228 million km"]], "Planets")),
      Q("Look at the table. How much did Aylin spend on the book?", "40 liras", ["25 liras", "60 liras", "80 liras"], "The table shows the book costs 40 liras.", tablo(["Item", "Price"], [["Book", "40 liras"], ["Pen", "10 liras"], ["Bag", "250 liras"]], "Aylin's shopping")),
    ],
    "2.3": [
      Q("Look at the table. Which festival is in autumn?", "Apple Festival", ["Kite Festival", "Rose Festival", "Snow Festival"], "Apple Festival is in October (autumn).", tablo(["Festival", "Month"], [["Rose Festival", "May"], ["Kite Festival", "July"], ["Apple Festival", "October"], ["Snow Festival", "January"]], "Festivals")),
      Q("Look at the table. Who has the highest score?", "Emre", ["Ali", "Zeynep", "Cem"], "Emre has 95 points.", tablo(["Name", "Score"], [["Ali", "80"], ["Zeynep", "88"], ["Emre", "95"], ["Cem", "70"]], "Quiz scores")),
    ],
  },
  "8": {
    "1.1": [
      Q("Look at the table. Which subject does Ali like the most?", "Science", ["History", "Art", "Music"], "Science has the highest rating (5).", tablo(["Subject", "Rating (1-5)"], [["Science", "5"], ["History", "3"], ["Art", "2"], ["Music", "4"]], "Ali's favourite subjects")),
      Q("Look at the table. Who sleeps the most?", "Tuna", ["Selin", "Mert", "Ada"], "Tuna sleeps 9 hours, the most.", tablo(["Name", "Sleep (hours)"], [["Selin", "7"], ["Tuna", "9"], ["Mert", "6"], ["Ada", "8"]], "Sleep time")),
    ],
    "1.2": [
      Q("Look at the table. Which exercise burns the most calories?", "Swimming", ["Walking", "Yoga", "Cycling"], "Swimming burns 500 calories, the most.", tablo(["Exercise", "Calories (per hour)"], [["Walking", "250"], ["Yoga", "200"], ["Cycling", "400"], ["Swimming", "500"]], "Exercise")),
      Q("Look at the table. On which day can you visit the fair?", "Saturday", ["Monday", "Wednesday", "Every day"], "The fair is open only on Saturday. It is closed on Monday and Wednesday.", tablo(["Day", "Fair"], [["Monday", "Closed"], ["Wednesday", "Closed"], ["Saturday", "Open"]], "Fair days"), {u:"on the Phone", k:"on the Phone"}),
    ],
    "1.3": [
      Q("Look at the table. Which hobby is the most popular?", "Reading", ["Painting", "Chess", "Gardening"], "Reading has the highest number (14).", tablo(["Hobby", "Students"], [["Reading", "14"], ["Painting", "6"], ["Chess", "5"], ["Gardening", "3"]], "Hobby survey")),
      Q("Look at the table. How many hours does Cem play games on weekdays?", "Two hours", ["One hour", "Four hours", "Six hours"], "The table shows 2 hours on weekdays.", tablo(["Day", "Hours of gaming"], [["Weekdays", "2"], ["Weekends", "4"]], "Cem's gaming time")),
    ],
    "2.1": [
      Q("Look at the table. Which city has the lowest temperature?", "Kars", ["Izmir", "Mersin", "Adana"], "Kars is -10°C, the lowest.", tablo(["City", "Temperature"], [["Izmir", "11°C"], ["Mersin", "14°C"], ["Kars", "-10°C"], ["Adana", "13°C"]], "Winter temperatures"), {u:"Tourism", k:"Tourism"}),
      Q("Look at the table. What is the cheapest way to travel?", "Bus", ["Plane", "Taxi", "Train"], "The bus is the cheapest option.", tablo(["Transport", "Price"], [["Bus", "200 liras"], ["Train", "300 liras"], ["Taxi", "900 liras"], ["Plane", "1500 liras"]], "Travel costs")),
    ],
    "2.2": [
      Q("Look at the table. Which natural disaster happens most in the region?", "Flood", ["Earthquake", "Volcano", "Avalanche"], "Floods occurred 9 times, the most.", tablo(["Disaster", "Times"], [["Flood", "9"], ["Earthquake", "2"], ["Volcano", "0"], ["Avalanche", "1"]], "Disasters in 10 years")),
      Q("Look at the table. What should you do first in an earthquake?", "Drop, cover and hold on", ["Run to the lift", "Stand near a window", "Go outside immediately"], "The first rule is drop, cover and hold on.", tablo(["Step", "Action"], [["1", "Drop, cover and hold on"], ["2", "Stay away from windows"], ["3", "Go to an open area after shaking stops"]], "Earthquake safety")),
    ],
    "2.3": [
      Q("Look at the table. Which gadget is the most useful, according to the survey?", "Smartphone", ["Radio", "Typewriter", "Fax machine"], "Smartphone has the highest number of votes.", tablo(["Gadget", "Votes"], [["Smartphone", "40"], ["Radio", "5"], ["Typewriter", "1"], ["Fax machine", "2"]], "Gadget survey")),
      Q("Look at the table. Which energy source is renewable?", "Solar", ["Coal", "Oil", "Natural gas"], "Solar energy is renewable.", tablo(["Energy source", "Type"], [["Solar", "Renewable"], ["Coal", "Non-renewable"], ["Oil", "Non-renewable"]], "Energy")),
    ],
  },
};
