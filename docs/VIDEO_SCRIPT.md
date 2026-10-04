# Food 4U — 10-Minute Feature Walkthrough (Video Script)

**Length:** about 10 minutes (around 1,350 spoken words at a relaxed pace)
**Format:** screen recording of the app on a phone (or a browser set to phone size) with voice-over
**Columns:** *ON SCREEN* = what to tap or show · *SAY* = narration

---

## Before you hit record

1. Run the app (`ionic serve`, or the Android build) and **create a fresh account** so the screens are clean.
2. Make sure your **Home** address is the primary one (Account → Address).
3. The demo verification code for phone and payment screens is **123456**.
4. **Timing tip:** a delivery runs on a **3-minute demo timer**. The script places the order at **4:30** and comes back to it at **7:30**, so the delivery finishes on camera. If you record in separate takes, place the order, record the Account section, then return.
5. Turn on Do Not Disturb so phone notifications don't interrupt the recording.

---

## 0:00 – 0:40 · Intro

**ON SCREEN:** The Food 4U login screen with the burger logo.

**SAY:**
> "Hi! This is Food 4U, a food delivery app we built with Ionic and Angular. In the next ten minutes I'll take you through the whole experience: signing up, finding food, customizing a meal, checking out with different payment methods, and our newest feature, live order tracking from the kitchen to your door. Let's get started."

---

## 0:40 – 1:30 · Sign up and phone verification

**ON SCREEN:** Tap **Sign Up**. Fill in name, email, password and confirm password. Tap **Create account**. On *Registration*, choose a country code, type a phone number, tap **Send Code**, then enter **123456** on *Verification*.

**SAY:**
> "New users sign up with their name, email and a password. The password is hashed before it's saved, so it's never stored as plain text.
> Next we verify a phone number. Pick your country code, enter your number, and we send a six-digit code. For this demo the code is always one-two-three-four-five-six. Once that's verified, we land on the home screen."

---

## 1:30 – 2:30 · Home screen

**ON SCREEN:** The Home screen. Point at the **Deliver to** label at the top, then the **bell** icon. Scroll through the restaurant cards. Tap the **Pizza** and **Burgers** category pills, then **Offers** to show everything again. Scroll down to the **Meals** strip.

**SAY:**
> "This is Home. Up top you can see where we're delivering. It shows your primary saved address, here 'Home, 123 Main Street'. Tap it to switch addresses. On the right is the notification bell, which we'll come back to.
> Below that are our nine partner restaurants, each with its own photo, rating, delivery time and delivery fee. These category pills filter the list instantly: Pizza, Burgers, Sushi. 'Offers' shows everything again.
> And at the bottom there's a quick strip of popular meals from every restaurant, so you can jump straight to something that looks good."

---

## 2:30 – 3:10 · Search

**ON SCREEN:** Tap the **Search** tab. Type "ramen". Show the results, clear the box, and show the saved **search history**. Remove one history item.

**SAY:**
> "Search looks through restaurant names, cuisines and categories as you type. Let's try 'ramen'. Food 4U also remembers your recent searches, so you can repeat one with a single tap or remove the ones you don't need."

---

## 3:10 – 4:30 · Restaurant page and meal customization

**ON SCREEN:** Open **Tokyo Ramen Street**. Show the big photo header, then the **Meals**, **Reviews** and **Info** tabs. Go back to **Meals** and tap **+ Add** on *Spicy Miso Ramen*. On *Customize Meal*: choose **Large** (point at the price change), choose **Spicy**, set quantity to **2**, and type the note "Extra egg, no scallions". Tap **Add to Cart**.

**SAY:**
> "Every restaurant has its own page. The Meals tab lists the menu with a photo of every dish. Reviews shows ratings from other customers, and you can post, edit or delete your own. Info has the address, opening hours and contact number.
> Let's order the Spicy Miso Ramen. On the customize screen I can pick a size, and the price updates right away: Large adds forty pesos. I'll make it spicy, order two, and leave a note for the kitchen, 'extra egg, no scallions'. That note now goes all the way through: it shows up in the cart, at checkout, and on the order itself.
> One more thing: if you've set allergies in your Personal Taste settings, meals that might contain them get a warning badge right on the menu."

**ON SCREEN:** Point at the floating **Cart** popup (the note is visible). Tap **Go to Cart**, then continue to **Checkout**.

---

## 4:30 – 5:30 · Checkout, vouchers and payment ⏱ *(start of the 3-minute delivery)*

**ON SCREEN:** On *Checkout*: show the item list with the note, the delivery address and the note-to-rider field. Tap **Choose voucher** and show the list (for example **SAVE25**). Select one and point at the discount. Show the three payment methods. Pick **Cash on Delivery** and tap **Place Order**.

**SAY:**
> "Checkout brings everything together: your items, your delivery address and a note for the rider, like a landmark or gate color.
> Food 4U supports vouchers. Some, like SAVE25, work everywhere, and others belong to one restaurant, like BELLA10 for Bella Napoli. The app checks whether a voucher is valid for this order and shows the discount before you pay.
> There are three ways to pay: Cash on Delivery, GCash, or a credit or debit card. GCash and card payments go through a verification screen first. I'll keep it simple with Cash on Delivery. Place order!"

---

## 5:30 – 6:30 · NEW: Live order tracking

**ON SCREEN:** The app opens **Track Order** automatically. Point at, in order: the **status pill** and **"Arriving in 2:5x"** countdown, the **map** (restaurant 🍽️, home 🏠, rider dot), the **Order Status** timeline, and the **rider card** with Call and Chat.

**SAY:**
> "This is our newest feature: live order tracking. As soon as you place an order you land here.
> At the top is the current status and a live countdown to arrival. Below it, a map shows the route from the restaurant to your address. Once the rider picks up your food, you'll watch them move along that route in real time.
> The Order Status timeline shows each step: Order placed, Preparing, Rider picked up, On the way, and Delivered, each with the time it happened.
> You can also see your rider's name, rating, motorbike and plate number, with Call and Chat buttons so you can reach them directly.
> For this demo a whole delivery takes about three minutes, so we'll check back soon."

---

## 6:30 – 7:00 · NEW: Notifications

**ON SCREEN:** Go back to **Home** and point at the red **badge** on the bell. Tap it. Show the list ("Order placed", "Preparing your food"…). Tap one to jump back to tracking, then go back. Show **Mark all read**.

**SAY:**
> "Back on Home, the bell has a red badge. Every time your order changes status, you get a notification. Tap the bell to see them all, newest first. Tap any order update to jump straight back to its tracking page, or mark everything as read."

---

## 7:00 – 7:30 · Orders tab

**ON SCREEN:** Tap the **Orders** tab. Show the order under **Current Orders** with its status pill and **Track** button. *(If it's still 'Preparing', point out the **Cancel** button too.)* Scroll to **Past Orders** and point at **Order Again**.

**SAY:**
> "The Orders tab has your current orders at the top, each with its live status and a Track button. You can cancel an order while the kitchen is still preparing it, but once the rider picks it up the Cancel button disappears, just like a real delivery app.
> Below that is your order history. 'Order Again' rebuilds an old order in your cart in one tap."

---

## 7:30 – 8:30 · NEW: Delivered and rate your order ⏱ *(delivery should be done)*

**ON SCREEN:** Tap **Track** (or the "Order delivered" notification). Show **"Delivered at …"**, the completed purple route and all five timeline steps ticked. Scroll to **How was your food?**, tap **5 stars**, type a short comment and tap **Post review**. Then open the restaurant's **Reviews** tab and show your review at the top.

**SAY:**
> "And our food has arrived! The timeline is complete and the whole route is drawn on the map. The order also moved itself from Current Orders into your history.
> Right after delivery, Food 4U asks how your food was. I'll give it five stars and a quick comment. Post. And here it is on the restaurant's Reviews tab, so the next customer benefits from our feedback straight away."

---

## 8:30 – 9:30 · Account and personalization

**ON SCREEN:** Tap the **Account** tab. Show the profile card (order count, cart status). Then open each of these briefly:
- **Address**: add, edit, or set a primary address
- **Personal Taste**: food preferences (Vegetarian, Halal-friendly…), allergens plus a custom allergy, spice level, then **Save**
- **Vouchers**: your available codes
- **Food4U Pro**: Monthly ₱149 and Quarterly ₱399 plans
- **Invite Friends**, **Help Center**, **Terms & Policies**

**SAY:**
> "Finally, the Account tab. Your profile shows your order count and whether you have an active cart.
> In Address you can save several places, like home and office, and choose which one is primary. That's the one shown on the Home screen.
> Personal Taste is where you set diet preferences, allergens and your spice level. You can even add your own allergy, like shrimp paste, and the menu will warn you about it.
> You'll also find your vouchers, Food4U Pro membership plans with member-only perks, a referral page to invite friends, a Help Center, and our terms and policies. And of course, Log out."

---

## 9:30 – 10:00 · Wrap-up

**ON SCREEN:** Go back to **Home** and scroll slowly through the restaurant photos.

**SAY:**
> "So that's Food 4U: browse, customize, pay your way, and follow your food all the way to your door, then tell everyone how it was. Everything is saved on your device, so your cart, addresses, orders and reviews are still there the next time you open the app. Thanks for watching!"

---

### Quick reference for the recording

| Item | Value |
|---|---|
| Phone / payment verification code | `123456` |
| Vouchers to show | `SAVE25` (any restaurant), `BELLA10`, `SAKURA30`, `BURGER15`, `SPICE40` |
| Delivery demo timeline | Placed → Preparing (0:20) → Rider picked up (1:15) → On the way (1:35) → Delivered (3:00) |
| Cancel allowed | Only while "Order placed" or "Preparing" |
| Photo credits | `src/assets/images/CREDITS.md` |
