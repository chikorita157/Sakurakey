**🌎 **Sakurakey**, a soft fork of [Sharkey](https://joinsharkey.org/) is an open source, decentralized social media platform that's free forever! 🚀**

**Note:** This repo contains some changes specifically made for [Sakurajima Social](https://sakurajima.social) and will contain references to it. This repo is here to comply with the AGPL and also deploy changes to our instance. Use at your own risk, using the official repo is recommended.

# Differences from the Upstream Version (all on the Frontend)
* "Have a look at the timeline" is a button instead a timeline widget when logged out so the user can view the local and global timelines comfortably.
* Change interface font to match Sakurajima Mastodon server
* Sakura themes are the default themes along with Yozakura for dark mode. They are built into thias version
* Added menu items pertaining to Sakurajima in the instance menu
* Added Rose Pine themes from Firefish
* Removed the Advertisement menu item (Sakurajima Social has no ads and never will)
* Different defaults to make Sharkey more approachable for users who used Twitter/X.
* Added link to the repo of the Sakura version of Sharkey.
* Removed Channels (Deprecated on this softfork)
* Only index Public notes, not notes that are Home/Unlisted/Silent Public
* Only search public notes from non suspended/silenced servers and users.
* "Home" visibility renamed to "Quiet Public" (matching Mastodon) and use the moon icon and Local/Defederated posts use the home icon
* Sort Lists and Antennas (cherrypicked from [here](https://github.com/aliceif/misskey/commit/9969413adbb506d2076a4b33eb64f10643c59c73) by aliceif)

<div>

## ✨ Features
- **ActivityPub support**\
Not on Sharkey? No problem! Not only can Sharkey instances talk to each other, but you can make friends with people on other networks like Mastodon and Pixelfed!
- **Federated Backgrounds and Music status**\
You can add a background to your profile as well as a music status via ListenBrainz, show everyone what music you are currently listening too
- **Mastodon API**\
Sharkey implements the Mastodon API unlike normal Misskey
- **UI/UX Improvements**\
Sharkey makes some UI/UX improvements to make it easier to navigate
- **Sign-Up Approval**\
With Sharkey, you can enable sign-ups, subject to manual moderator approval and mandatory user-provided reasons for joining.
- **Rich Web UI**\
	Sharkey has a rich and easy to use Web UI!
	It is highly customizable, from changing the layout and adding widgets to making custom themes.
	Furthermore, plugins can be created using AiScript, an original programming language.
- And much more...

</div>

<div style="clear: both;"></div>
