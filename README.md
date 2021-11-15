<h1 align="center">
  <img src="https://github.com/Yudodissed/dfrep/blob/main/logo.png?raw=tru" width="500px" alt="dfrep"></a>
</h1>

<p align="center">
 <a>
  <img src="https://img.shields.io/badge/Version-1.1.2-blueviolet" alt="Version 1.1.2">
 </a>
 <a href="https://www.gnu.org/licenses/gpl-3.0">
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GNU License">
 </a>
</p>

<p align="center">
  dfrep (all lowercase) is an in-game reputation bot for the Minecraft server DiamondFire. Mainly, dfrep is used by sending messages to the in-game bot to create a trust profile for users. In addition to this, some utility commands are added. dfrep is not officially affiliated with DiamondFire, but permission has been given by an admin for me to run this bot.<br>
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
    <td>/help [command]</td>
    <td>None</td>
    <td>Lists all commands. If argument is given, provides information on command.</td>
  </tr>
  <tr>
    <td>/info</td>
    <td>None</td>
    <td>Gives some information about dfrep.</td>
  </tr>
  <tr>
    <td>/register</td>
    <td>None</td>
    <td>Registers you in the database. Is required for most commands.</td>
  </tr>
  <tr>
    <td>/profile [user]</td>
    <td>Registered</td>
    <td>Provides reputation scores, amount of ratings, and the featured badge of a player. Giving no user will show your own profile.</td>
  </tr>
  <tr>
    <td>/+rep &lt;user&gt; [build/dev]</td>
    <td>Registered</td>
    <td>Increases a players reputation score. Not providing a category will increase a players generic reputation. Providing a category will increase their rep of that type.</td>
  </tr>
  <tr>
    <td>/-rep &lt;user&gt; [build/dev]</td>
    <td>Registered</td>
    <td>Decreases a players reputation score. Not providing a category will decrease a players generic reputation. Providing a category will decrease their rep of that type.</td>
  </tr>
  <tr>
    <td>/unrep &lt;user&gt;</td>
    <td>Registered</td>
    <td>Undoes a +rep or -rep you've given a player.</td>
  </tr>
  <tr>
    <td>/mail [del &lt;index&gt;/clear [type]/&lt;index&gt;]</td>
    <td>Registered</td>
    <td>No argument lists all mail. Giving "del" will delete letter at index. Giving "clear" will remove all letters, or all of type if given. If just an index is given, that letter will be read.
     </td>
  </tr>
  <tr>
    <td>/letter &lt;user&gt; &lt;message&gt;</td>
    <td>Registered</td>
    <td>Sends a letter to the inbox of a player that can be read later. Afterwards, running /letter confirm is required.</td>
  </tr>
  <tr>
    <td>/letter confirm</td>
    <td>Registered</td>
    <td>Confirms the sending of a message to a players inbox that can be read later.</td>
  </tr>
</tbody>
</table>

---

# FAQ

## Why does response time vary so much?
  In short, because of DiamondFires anti-spam feature. Each time dfrep sends a message, it calculates the cooldown it needs until it can send another
  message. This means it is sending messages as fast as possible, but if multiple users are using it at once, it may lag behind by a lot. On average,
  it takes a cooldown of about two to three seconds per message.

## What does "Trusted User" mean?
  A trusted user is someone who has proven themselves to be responsible and reputable. This is represented by a badge on their profile. As a trusted user,
  they can use some commands others can't, and have a reduced cooldown on some commands. This badge can not yet currently be earned, as the badge system is not yet implemented.
  
## How can I report a bug?
  Use the issues section on this Github!
  
## How should I report vulnerabilites or malicious users?
  DM me on Discord: @Yudo#8472. Don't make an issue on the Github!

---

# Contributors and License

This project is licensed under the terms of the [GNU GPLv3 License](/LICENSE). Although not required, it would be appreciated you ask before you copy a significant portion of the code. 

dfrep was written by Yudodiss, with dev and testing help from Proxxa and Mr_Dumpling.
