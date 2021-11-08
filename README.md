<h1 align="center">
  <img src="https://github.com/Yudodissed/dfrep/blob/main/logo.png?raw=tru" width="500px" alt="dfrep"></a>
</h1>

<p align="center">
 <a>
  <img src="https://img.shields.io/badge/Version-1.0.1-blueviolet" alt="Version 1.0.1">
 </a>
 <a href="https://www.gnu.org/licenses/gpl-3.0">
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GNU License">
 </a>
</p>

<p align="center">
  dfrep (all lowercase) is an in-game reputation bot for the Minecraft server DiamondFire. Mainly, dfrep is used by sending messages to the in-game bot to create a trust profile for users. In addition to this, some utility commands are added. dfrep is not officially affiliated with DiamondFire, but permission has been given by an admin for me to run this bot. This repository may be behind the codebase the bot is actually running on. (it probably is) <br> <br> If you're here from the bot, <a href="https://github.com/Yudodissed/dfrep/tree/main?readme=1#commands">click here for the command list.</a>
</p>

<h3 align="center">
<a href="https://github.com/Yudodissed/dfrep/tree/main?readme=1#commands">Commands</a> | <a href="https://github.com/Yudodissed/dfrep/tree/main?readme=1#faq">FAQ</a> | <a href="https://github.com/Yudodissed/dfrep/tree/main?readme=1#contributors-and-license">Contributors and License</a>
<h3>

---

# Commands
Because dfrep is limited to only one message at a time as a response, commands are listed here in detail.
In this document, when the format ```/[command]``` is used, it is implied you are writing out ```/msg dfrep [command]```. <br> Arguments written in less-than/greater-than signs (<>) are required, and arguments written in square brackets ([]) are optional. 

<table>
<thead>
  <tr>
    <th>Command / Syntax</th>
    <th>Requirement</th>
    <th>Action</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>/help</td>
    <td>None</td>
    <td>Lists all commands and provides direction to here.</td>
  </tr>
  <tr>
    <td>/register</td>
    <td>None</td>
    <td>Registers you in the database. Is required for most commands.</td>
  </tr>
  <tr>
    <td>/profile [user]</td>
    <td>Registration</td>
    <td>Provides reputation scores, amount of ratings, and the featured badge of a player. Giving no user will show your own profile.</td>
  </tr>
  <tr>
    <td>/+rep &lt;user&gt; [build|dev]</td>
    <td>Registration</td>
    <td>Increases a players reputation score. Not providing a category will increase a players generic reputation. Providing a category will increase their rep of that type.</td>
  </tr>
  <tr>
    <td>/-rep &lt;user&gt; [build|dev]</td>
    <td>Registration</td>
    <td>Decreases a players reputation score. Not providing a category will decrease a players generic reputation. Providing a category will decrease their rep of that type.</td>
  </tr>
  <tr>
    <td>/unrep &lt;user&gt;</td>
    <td>Registration</td>
    <td>Undoes a +rep or -rep you've given a player.</td>
  </tr>
  <tr>
    <td>/mail [index]</td>
    <td>Registration</td>
    <td>If no argument is given, lists basic information about inbox. If argument is given, reads the message at index.</td>
  </tr>
  <tr>
    <td>/mail del &lt;index&gt;</td>
    <td>Registration</td>
    <td>Deletes a letter from your inbox.</td>
  </tr>
  <tr>
    <td>/letter &lt;user&gt; &lt;message&gt;</td>
    <td>Trusted User</td>
    <td>Sends a letter to the inbox of a player that can be read later. Afterwards, running /letter confirm is required.</td>
  </tr>
  <tr>
    <td>/letter confirm</td>
    <td>Trusted User</td>
    <td>Confirms the sending of a message to a players inbox that can be read later.</td>
  </tr>
</tbody>
</table>

---

# FAQ

## What does "Trusted User" mean?
  A trusted user is someone who has proven themselves to be responsible and reputable. This is represented by a badge on their profile. As a trusted user,
  they can use some commands others can't, and have a reduced cooldown on some commands. This badge can currently be earned by gaining at least 5 total karma.
  This requirement will increase as the userbase does.
  
## How can I report a bug?
  Use the issues section on this Github!
  
## How should I report vulnerabilites or malicious users?
  DM me on Discord: @Yudo#8472. Don't make an issue on the Github!

---

# Contributors and License

This project is licensed under the terms of the [GNU GPLv3 License](/LICENSE). Although not required, it would be appreciated you ask before you copy a significant portion of the code. 

dfrep was written by Yudodiss, with dev and testing help from Proxxa and Mr_Dumpling.
