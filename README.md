#Filmstrip jQuery Plugin

##About
Transforms a group of children into a moveable element.

##Note!
Plugin utilizes a generator plugin by Jamie Talbot (http://jamietalbot.com)
http://jamietalbot.com/2010/08/22/object-oriented-jquery-plugins

##Features
- allows you to have multiple instances on the page
- each instance has the abililty to interactive with one another
- mutilple callback options
- multiple navigation options

##Usage
Initiate plugin
    $("element").filmstrip({});

Though not required, instantaiting each instance to a variable allows you to call its public methods
    var fs = $("element").filmstrip({});
    fs.nextFrame();

##Found bug?
Submit a bug report
<https://github.com/marlonvalenzuela/filmstrip/issues>
