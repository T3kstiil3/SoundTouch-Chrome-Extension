# SoundTouch-Chrome-Extension

![users](https://img.shields.io/chrome-web-store/users/gapfkijlllenhmgddoldcfedfiiakfgg.svg) ![version](https://img.shields.io/chrome-web-store/v/gapfkijlllenhmgddoldcfedfiiakfgg.svg) ![ratingscount](https://img.shields.io/chrome-web-store/rating-count/gapfkijlllenhmgddoldcfedfiiakfgg.svg) ![rating](https://img.shields.io/chrome-web-store/rating/gapfkijlllenhmgddoldcfedfiiakfgg.svg) 

[Link Chrome Extension](https://chrome.google.com/webstore/detail/soundtouch-chrome-extensi/gapfkijlllenhmgddoldcfedfiiakfgg)

# Description

The extension Chrome Extension SoundTouch will enable all the people connected to your networks to control your Bose speaker. Do not fight anymore for the remote ! Use this extension ! Display the playing song and change playlist.

# Preview

<img src="img/preview.jpg" width="350"/>

# Code

## Gulp task

```
# Zip project 
gulp zip
...
```

## Electron task

```
# Create binaries for both Windows and OS X
npm run pack

# Create installer for OS X
npm run build:osx

# Start app directly
npm run dev
...
```

# No Bose SoundTouch ?

[Bose Système audio sans fil SoundTouch 10 - Noir](http://www.amazon.fr/gp/product/B0117RGGDE/ref=as_li_tl?ie=UTF8&camp=1642&creative=19458&creativeASIN=B0117RGGDE&linkCode=as2&tag=aureli-21) <br>

[Système audio sans fil Bose SoundTouch 20 série III - Noir](http://www.amazon.fr/gp/product/B0117RGP58/ref=as_li_tl?ie=UTF8&camp=1642&creative=19458&creativeASIN=B0117RGP58&linkCode=as2&tag=aureli-21) <br>

[Système audio sans fil Bose SoundTouch 30 série III - Noir](http://www.amazon.fr/gp/product/B0117RGXLE/ref=as_li_tl?ie=UTF8&camp=1642&creative=19458&creativeASIN=B0117RGXLE&linkCode=as2&tag=aureli-21) <br>

# Load the extension (developer mode)

Extensions that you download from the Chrome Web Store are packaged up as .crx files, which is great for distribution, but not so great for development. Recognizing this, Chrome gives you a quick way of loading up your working directory for testing. Let's do that now.

Visit chrome://extensions in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox: ![chrome ico](https://developer.chrome.com/static/images/hotdogmenu.png) The menu's icon is three horizontal bars. and select Extensions under the Tools menu to get to the same place).

Ensure that the Developer mode checkbox in the top right-hand corner is checked.

Click Load unpacked extension… to pop up a file-selection dialog.

Navigate to the directory in which your extension files live, and select it.

Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

If the extension is valid, it'll be loaded up and active right away! If it's invalid, an error message will be displayed at the top of the page. Correct the error, and try again.

# TODO

- [x] Settings page
- [x] Integrate settings in popup
- [x] News styles
- [x] Search SoundTouch IP
- [x] Switch to AngularJs
- [ ] Electron app
- [ ] npm task
- [ ] Resolve Bug
- [ ] News features ?
