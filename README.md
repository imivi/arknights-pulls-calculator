# Arknights Pulls Calculator

<img src="https://imivi.github.io/arknights-pulls-calculator/bg/lambda.png" alt="logo" width="300" height="241">

➡️ https://imivi.github.io/arknights-pulls-calculator

## What is this?

This is an online tool for Arknights players to calculate resource income and future available pulls.

<img src="https://github.com/imivi/arknights-pulls-calculator/blob/main/docs/screenshot.jpg" alt="Screenshot">

## How do I use it?

* Enter your current resources at the top (orundum, HH permits, OP, monthly card).

* If you have cleared a past event, check "already cleared" on the banner for the rerun (the OP from the rerun will be disregarded), but 2000 orundum will be added from the Intelligence Certification Store.

* Scroll down to the banner you want to pull on, and check the blue column: these are the pulls you will have available **if you convert all of your OP** (the rate is 0.3 pulls/OP). The next two columns list the pulls **without converting OP** and the additional pulls you get from the converted OP.

* You can click on a pull count to **spend pulls**. The resources spent will be automatically calculated and deducted.

## NOT included in the calculations

* **24 free pulls** on each limited banner (every 3 months) are listed separately. They are excluded from the running total because they can't be saved.
* **Distinction Certificates** (gold certs), mostly from recruitment and extra event welfare tokens, you can exchange 258 of them for 38 HH permits.
* Any orundum from the **Intelligence Certification Store** (purple certs) beyond the 2000 orundum added on each rerun. Note that this orundum does not expire after the rerun ends. Therefore, if you are a new player or you have not cleared past reruns, you can still purchase any remaining orundum.
* Maintenance compensation and random gifts in the mail.

Note that you can add or deduct resources (orundum/permits/OP) at any date. Simply click on the resource total, and enter the amount gained or spent.

## Included in the calculations

|Resource|Sources|
|-|-|
|**Orundum**| Daily missions, weekly missions, monthly card (200/day), weekly annihilation (1800 orundum), new annihilation (every ~2 month), store (600/month), fortune strips during limited events (580 orundum/day), purple certs (2k orundum/rerun)|
|**HH permits**|login reward (1 on the 17th), store (4 permits/month), event shop (usually 3 permits)|
|**OP**|Event stages, login event, monthly card (6/month)|

## Assumptions

* Weekly annihilation reward (1800 orundum) received on Monday.
* 4 HH permits bought from the store (green certs) on the 1st day of the month.
* Weekly missions completed on Thursday (500 orundum).
* During limited events, fortune strips award ~580 orundum daily on average [according to my simulation](
https://github.com/imivi/arknights-pulls-calculator/blob/main/fortune_strips_simulation.py)

## FAQ

> I don't convert OP into pulls, I just want to know how many pulls I can get from tickets and orundum.

Just ignore the blue column. The next column (red) lists the pulls you get from spending tickets and orundum.

> I plan on buying HH permits with gold certs. How do I track it?

The calculator does not track gold cert income because it's highly variable between players. However you can manually add HH permits by clicking on the permit count on any date.

> I'm a whale and I plan on buying OP from packs. How do I track it?

Click on the OP count (any date), and enter a positive value.

> I plan on buying skins with OP. How do I track it?

Click on the OP count (any date), and enter a negative value.