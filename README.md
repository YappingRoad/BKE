# BKE
BKE (Bill Kolumbert Engine) is a web-based **2D** Game Engine that uses TypeScript. 

It can compile to web, and can run in Electron (which can run on Windows, macOS, and Linux).

## Notes
It isn't in a usable state at the moment in terms of creating new projects as I built it for the WIP game I am working on with my friends called Bill Kolumbert.

So basically, don't expect incredible code quality, and theres probably alot of bugs in the code.

I built it as I didn't really like other 2D engines and wanted the flexibility of the web, and the flexibility of being able to add features to my own engine.

I may make a template project in time so the project is actually usable.

Contact me at contact@letsgoaway.dev 

### Similar (programming wise) to
- HaxeFlixel
- Raylib

## Features

### Renderer modes
- Canvas2D
- DOM (Document Object Manipulation) 
- WebGL 1.0 & 2.0
- SVG (Scalable Vector Graphics)
### Audio
- Left and right panning audio
- Specific Music channel and Sound channel for adjusting volume
### Input
- Callback based for low latency (instead of checking for input every frame, you register a callback for when a button is pressed)
- Keyboard support
- Mouse support
- Controller Support
  - Allows you to set a "pointer input mode" for a controller which maps inputs to mouse inputs
  - Gyro support for some controllers over WebHID (DualSense, JoyCon)
  - Wiimote support (including IR pointer input)
  - Controllers are handled universally (i.e controller.BPAD.down is Cross on DualSense but B on Joy-Con)
