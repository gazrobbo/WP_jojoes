"use strict";

/*--------------------------------------------------------------
# Adding some global events and functions users can use via data attributes
--------------------------------------------------------------*/

/**
 * resize menu buttons on load. also runs on resize.
 * menu button is not inside site-top for various reasons (we dont want x to be inside or when menu opens the ex is uinderneath.
 * so we use this function to match the site -top height and center it as if it was inside
 */
var menuButtons = '';

function placeMenuButtons() {
  var $siteTopHeight = document.querySelector('.site-top');

  if ($siteTopHeight != null) {
    $siteTopHeight = $siteTopHeight.clientHeight;
  } // let adminbar = document.querySelector('#wpadminbar');
  // let adminbarHeight = 0;
  //
  // if (adminbar !== null) {
  // 	adminbarHeight = adminbar.clientHeight;
  // }


  if (menuButtons.length) {
    menuButtons.forEach(function (button) {
      button.style.height = $siteTopHeight + 'px';
    });
  }
}
/*--------------------------------------------------------------
# IGN Events
--------------------------------------------------------------*/


document.addEventListener('DOMContentLoaded', function () {
  /*------- Add touch classes or not --------*/
  if (!("ontouchstart" in document.documentElement)) {
    document.documentElement.className += " no-touch-device";
  } else {
    document.documentElement.className += " touch-device";
  }
  /*------- menu buttons --------*/
  //if the menu button is outside site-top. get both buttons for centering both.


  if (!document.querySelector('.app-menu')) {
    menuButtons = document.querySelectorAll('.panel-left-toggle, .panel-right-toggle');
  } else {
    //otherwise the menu button does not need to be centered because its part of the app menu and moves. (moved in navigation.js)
    menuButtons = document.querySelectorAll('.panel-right-toggle');
  } //we run menu button function below in resize event

  /*------- Toggle Buttons --------*/
  //trigger optional afterToggle event
  //adding new custom event for after the element is toggled


  var toggleEvent = null;

  if (isIE11) {
    toggleEvent = document.createEvent('Event'); // Define that the event name is 'build'.

    toggleEvent.initEvent('afterToggle', true, true);
  } else {
    toggleEvent = new Event('afterToggle', {
      bubbles: true
    }); //bubble allows for delegation on body
  } //add aria to buttons currently on page


  var buttons = document.querySelectorAll('[data-toggle]');
  buttons.forEach(function (button) {
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-checked', button.classList.contains('toggled-on') ? 'true' : 'false');
  }); //toggling the buttons with delegation click

  document.body.addEventListener('click', function (e) {
    var item = e.target.closest('[data-toggle]');

    if (item) {
      var $doDefault = item.getAttribute('data-default'); //normally we prevent default unless someone add data-default

      if (null === $doDefault) {
        e.preventDefault();
        e.stopPropagation();
      } //if data-radio is found, only one can be selected at a time.
      // untoggles any other item with same radio value
      //radio items cannot be untoggled until another item is clicked


      var radioSelector = item.getAttribute('data-radio');

      if (radioSelector !== null) {
        var radioSelectors = document.querySelectorAll("[data-radio=\"".concat(radioSelector, "\"]"));
        radioSelectors.forEach(function (radioItem) {
          if (radioItem !== item && radioItem.classList.contains('toggled-on')) {
            toggleItem(radioItem); //toggle all other radio items off when this one is being turned on
          }
        });
      } //if item has data-switch it can only be turned on or off but not both by this button based on value of data-switch (its either on or off)


      var switchItem = item.getAttribute('data-switch'); //finally toggle the clicked item. some types of items cannot be untoggled like radio or an on switch

      if (radioSelector !== null) {
        toggleItem(item, 'on'); //the item clicked on cannot be unclicked until another item is pressed
      } else if (switchItem !== null) {
        if (switchItem === 'on') {
          toggleItem(item, 'on');
        } else {
          toggleItem(item, 'off');
        }
      } else {
        toggleItem(item); //normal regular toggle can turn itself on or off
      }
    } //end if item found

  }); //actual toggle of an item and add class toggled-on and any other classes needed. Also do a slide if necessary

  function toggleItem(item) {
    var forcedState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';

    //toggle item
    if (forcedState === 'on') {
      item.classList.add('toggled-on'); //radio or data-switch of on will always toggle-on
    } else if (forcedState === 'off') {
      item.classList.remove('toggled-on'); //data-switch of off will always toggle off
    } else {
      item.classList.toggle('toggled-on'); //basic data toggle item
    } //is item toggled? used for the rest of this function to toggle another target if needed.


    var isToggled = item.classList.contains('toggled-on');
    item.setAttribute('aria-expanded', isToggled ? 'true' : 'false'); //get class to add to this item or another

    var $class = item.getAttribute('data-toggle'),
        $target = document.querySelectorAll(item.getAttribute('data-target'));

    if ($class === null || !$class) {
      $class = 'toggled-on'; //default class added is toggled-on
    } //special class added to another item


    if ($target.length) {
      $target.forEach(function (targetItem) {
        if (isToggled) {
          targetItem.classList.add($class);
        } else {
          targetItem.classList.remove($class);
        }

        targetItem.setAttribute('aria-expanded', isToggled ? 'true' : 'false'); //data slide open or closed

        if (targetItem.dataset.slide !== undefined) {
          var slideTime = targetItem.dataset.slide ? parseFloat(targetItem.dataset.slide) : .5;

          if (isToggled) {
            ignSlideDown(targetItem, slideTime);
          } else {
            ignSlideUp(targetItem, slideTime);
          }
        } //allow event to happen after click for the targeted item


        targetItem.dispatchEvent(toggleEvent);
      });
    } else {
      //applies class to the clicked item, there is no target
      if ($class !== 'toggled-on') {
        //add class to clicked item if its not set to be toggled-on
        if (isToggled) {
          item.classList.toggle($class);
        } else {
          item.classList.remove($class);
        }
      }
    } //trigger optional afterToggle event. continue the click event for customized stuff


    item.dispatchEvent(toggleEvent);
  }
  /*------- Moving items Event as well as all resizing --------*/
  //on Window resize we can move items to and from divs with data-moveto="the destination"
  //it will move there when the site reaches smaller than a size defaulted to 1030 or set that with data-moveat
  //the whole div, including the data att moveto moves back and forth


  var movedId = 0;

  function moveItems() {
    var windowWidth = window.innerWidth;
    var $moveItems = document.querySelectorAll('[data-moveto]');
    $moveItems.forEach(function (item) {
      var moveAt = item.getAttribute('data-moveat'),
          destination = document.querySelector(item.getAttribute('data-moveto')),
          source = item.getAttribute('data-movefrom');
      moveAt = moveAt ? moveAt : 1030;

      if (moveAt.startsWith('--')) {
        if (isIE11) {
          moveAt = 1030;
        } else {
          var cssVars = getComputedStyle(document.body); //get css variables

          moveAt = parseInt(cssVars.getPropertyValue(moveAt), 10);
        }
      }

      if (!destination) {
        return;
      } //if no data movefrom is found add one to parent so we can move items back in. now they go back and forth


      if (!source) {
        var sourceElem = item.parentElement.id; //if parent has no id attr, add one with a number so its unique

        if (!sourceElem) {
          item.parentElement.setAttribute('id', 'move-' + movedId);
          movedId++;
          sourceElem = item.parentElement.id;
        }

        item.setAttribute('data-movefrom', '#' + sourceElem);
      }

      source = document.querySelector(item.getAttribute('data-movefrom')); //if the screen is smaller than moveAt (1030), move to destination

      if (windowWidth < moveAt || moveAt == 0) {
        //no need to move if its already there...
        if (!destination.contains(item)) {
          if (item.hasAttribute('data-moveto-pos')) {
            destination.insertBefore(item, destination.children[item.getAttribute('data-moveto-pos')]);
          } else {
            destination.appendChild(item);
          }
        }
      } else {
        if (!source.contains(item)) {
          if (item.hasAttribute('data-movefrom-pos')) {
            source.insertBefore(item, source.children[item.getAttribute('data-movefrom-pos')]);
          } else {
            source.appendChild(item);
          }
        }
      } //show it


      item.classList.add('visible');
    });
    placeMenuButtons(); //running the moving of menu buttons here. nothing to do with moving items.
    //fix height of fixed holder fixed at top items

    document.querySelectorAll('.fixed-holder').forEach(function (fixed) {
      fixed.style.height = fixed.firstElementChild.clientHeight + 'px';
    });
  }

  window.addEventListener('resize', throttle(moveItems, 250));
  moveItems();
  document.documentElement.classList.remove('dom-loading'); //add finished loading Fump events

  var EventFinished = null;

  if (isIE11) {
    EventFinished = document.createEvent('Event'); // Define that the event name is 'build'.

    EventFinished.initEvent('afterIgnEvents', true, true);
  } else {
    EventFinished = new Event('afterIgnEvents');
  }

  document.dispatchEvent(EventFinished);
});
/*------- Function for hi red background image swap --------*/
//check if device is retina

function isHighDensity() {
  return window.matchMedia && window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches;
} //check if file exists on server before using


function fileExists(image_url) {
  var http = new XMLHttpRequest();
  http.open('HEAD', image_url, true);
  http.send();
  return http.status != 404;
} //Add inline retina image if found and on retina device. To use add data-high-res to an inline element with a background-image


if (isHighDensity()) {
  var retinaImage = document.querySelectorAll('[data-high-res]');
  retinaImage.forEach(function (item) {
    var image2x = ''; //if a high res is provided use that, else use background image but add 2x at end.

    if (item.dataset.highRes) {
      image2x = item.dataset.highRes;
    } else {
      //get url for original image
      var image = item.style.backgroundImage.slice(4, -1).replace(/"/g, ""); //add @2x to it if image exists.

      image2x = image.replace(/(\.[^.]+$)/, '@2x$1');
    }

    if (fileExists(image2x)) {
      item.style.backgroundImage = 'url("' + image2x + '")';
    }
  });
}
"use strict";

//turn icons into svg if using the icons that come with theme folder
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.svg-icon').forEach(function (icon) {
    icon.classList.remove('svg-icon'); //classlist.value does not wokr in ie11. use getAttrbiute

    var iconClass = icon.getAttribute('class'); //ie11 does not work well with nodes. needed to add as string. no createelementNS

    var iconString = "<svg class=\"icon ".concat(iconClass, "\" role=\"img\"><use href=\"#").concat(iconClass, "\" xlink:href=\"#").concat(iconClass, "\"></use></svg>"); // let iconsvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    // iconsvg.setAttribute('class', 'icon ' + iconClass);
    // iconsvg.setAttribute('role', 'img');
    //iconsvg.innerHTML = `<use href="#${iconClass}" xlink:href="#${iconClass}"></use>`;

    icon.insertAdjacentHTML('afterend', iconString);
    icon.remove();
  });
});
"use strict";

function myFunction() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("readMoreBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}
"use strict";

/*------- move submenus if too close to edge on desktop --------*/
function fixOffScreenMenu(menu) {
  //make item visible so we can get left edge
  menu.style.display = 'block';
  menu.style.opacity = '0';
  var rightEdge = menu.getBoundingClientRect().right;
  var leftEdge = menu.getBoundingClientRect().right; //set menu back

  menu.style.display = '';
  menu.style.opacity = '';
  var viewport = document.documentElement.clientWidth; //if the submenu is off the page, pull it back somewhat

  if (rightEdge > viewport) {
    menu.style.left = '40px';
  }

  if (leftEdge < 0) {
    menu.style.left = '60%';
  }
}
/*
open and closes a menu dropdown based on passing the dropdown button. The buttons class determines if it opens or closes
for it to open make sure the button being passed has a class of toggled-on
 */


function openCloseMenu(menuButton) {
  var menuItem = menuButton.closest('li');
  var subMenu = menuItem.querySelector('.sub-menu');
  var isToggled = menuButton.classList.contains('toggled-on') ? 'open' : 'close';

  if (isToggled === 'open') {
    fixOffScreenMenu(subMenu); //add class toggled-on to li. cant do it via data-target cause menu might be showing twice on page

    menuItem.classList.add('toggled-on');
    ignSlideDown(subMenu);
    document.querySelector('#page').addEventListener('click', function (e) {
      if (!e.target.closest('.menu-item.toggled-on')) {
        //close menus
        menuButton.classList.remove('toggled-on');
        openCloseMenu(menuButton);
      }
    }, {
      once: true
    });
  } else {
    menuItem.classList.remove('toggled-on');
    ignSlideUp(subMenu);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('click', function (e) {
    var item = e.target.closest('.menu a[href="#"]');

    if (item && item.nextElementSibling != null) {
      e.preventDefault();
      item.nextElementSibling.click();
    }
  });
  /*------- slide sub menus open and closed when a dropdown button is clicked --------*/

  document.body.addEventListener('afterToggle', function (evt) {
    //for every dropdown menu button (>), when clicked, toggle the li parent and open the sub-menu with slide
    if (evt.target.closest('.submenu-dropdown-toggle')) {
      openCloseMenu(evt.target.closest('.submenu-dropdown-toggle'));
    }
  });
  /*------- Open any current menu items in vertical menus --------*/
  //if a vertical menu has a current item it is set to display block. We can target that and use it to set the click to open

  document.querySelectorAll('.menu .current-menu-item .sub-menu, .menu .current-menu-parent .sub-menu').forEach(function (subMenu) {
    //if its a vertical menu
    if (getComputedStyle(subMenu.closest('.menu')).flexDirection === 'column') {
      subMenu.style.display = 'block';
      subMenu.style.height = 'auto';
      subMenu.closest('.menu-item').classList.add('toggled-on');
      subMenu.closest('.menu-item').querySelector('.submenu-dropdown-toggle').classList.add('toggled-on');
    }
  });
  /*------- Tabbing through the menu for ADA compliance --------*/

  var lastTabbedItem = ''; //focus

  document.body.addEventListener('focusin', function (e) {
    if (e.target.closest('.menu-item-link a')) {
      var menuItemLink = e.target.closest('.menu-item-link a');
      window.addEventListener('keyup', function (e) {
        var code = e.keyCode ? e.keyCode : e.which; //tab or shift tab

        if (code === 9 || code === 16) {
          menuItemLink.parentElement.classList.add('focus'); //add focus to .menu-item-link
          //if this element has a dropdown near it, toggle it now

          if (menuItemLink.nextElementSibling !== null && !menuItemLink.closest('li').classList.contains('toggled-on')) {
            menuItemLink.nextElementSibling.click(); //click the button to open the sub-menu
          } //if there is an item focused before


          if (lastTabbedItem) {
            //check if last item had a sub menu and we are not inside it now
            if (lastTabbedItem.nextElementSibling !== null && !lastTabbedItem.closest('li').contains(menuItemLink)) {
              lastTabbedItem.nextElementSibling.click();
            }
          }
        }
      }, {
        once: true
      });
    }
  }); //blur

  document.body.addEventListener('focusout', function (e) {
    if (e.target.closest('.menu-item-link a')) {
      var menuItemLink = e.target.closest('.menu-item-link a');
      window.addEventListener('keyup', function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        console.log(code);

        if (code === 9 || code === 16) {
          //blur current tabbed item, but dont close it if its a sub-menu
          menuItemLink.parentElement.classList.remove('focus');
          lastTabbedItem = menuItemLink;
          var subMenu = menuItemLink.closest('.sub-menu'); //if we blurred an item in a sub-menu

          if (subMenu !== null) {
            console.log('blurred item inside sub-menu');
            var menuItem = menuItemLink.closest('.menu-item'); //if its the last item in the submenu and it does not have a sub-menu itself

            if (menuItem.nextElementSibling == null && menuItem.querySelector('.sub-menu') == null) {
              menuItem.parentElement.closest('.menu-item').querySelector('.submenu-dropdown-toggle').click();
            }
          }
        }
      }, {
        once: true
      });
    }
  }); //app-menu ability for the top menu

  var body = document.body;
  var menuToggle = document.querySelector('.panel-left-toggle');
  var topNav = document.querySelector('.site-top');
  var page = document.querySelector('#page'); //first move the button into site-top if app-menu is being used cause we dont want it on the outside

  if (body.classList.contains('app-menu')) {
    topNav.append(menuToggle);
  }

  function closeAppMenu(e) {
    e.preventDefault();
    menuToggle.click();
  } //when button is opened we will lock the body so there is no scrolling and then open the page


  if (menuToggle) {
    menuToggle.addEventListener('afterToggle', function (e) {
      //if button has been toggled on
      if (menuToggle.classList.contains('toggled-on')) {
        body.classList.add('body-lock'); //clicking anywhere outside the menu will close it

        document.querySelector('.site-content').addEventListener('click', closeAppMenu, {
          once: true
        });
      } else {
        document.querySelector('.site-content').removeEventListener('click', closeAppMenu);

        if (body.classList.contains('app-menu')) {
          page.addEventListener('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
            body.classList.remove('body-lock'); //only remove toggle and hide menu once page holder finishes its transition to cover it.
          }, {
            once: true
          });
        } else {
          body.classList.remove('body-lock');
        }
      }
    });
  }
}); //end ready

jQuery(function ($) {
  //move logo in middle of menu on desktop if logo is middle position
  if ($('.logo-in-middle').length) {
    var navigationLi = $('.site-navigation__nav-holder .menu li');
    var middle = Math.floor($(navigationLi).length / 2) - 1; //add logo to the middle when page loads

    $('<li class="menu-item li-logo-holder"><div class="menu-item-link"></div></li>').insertAfter(navigationLi.filter(':eq(' + middle + ')'));
    $('.site-logo').clone().appendTo('.li-logo-holder');
  }
});
"use strict";

jQuery(function ($) {
  'use strict'; // the css selector for the container that the image should be attached to as a background-image

  var imgContainer = '.background-image, .cover-image';

  function getCurrentSrc(element, cb) {
    var _getSrc;

    if (!window.HTMLPictureElement) {
      if (window.respimage) {
        respimage({
          elements: [element]
        });
      } else if (window.picturefill) {
        picturefill({
          elements: [element]
        });
      }

      cb(element.src);
      return;
    }

    _getSrc = function getSrc() {
      element.removeEventListener('load', _getSrc);
      element.removeEventListener('error', _getSrc);
      cb(element.currentSrc);
    };

    element.addEventListener('load', _getSrc);
    element.addEventListener('error', _getSrc);

    if (element.complete) {
      _getSrc();
    }
  }

  function setBgImage() {
    $(imgContainer).each(function () {
      var $this = $(this),
          img = $this.find('img').get(0);
      getCurrentSrc(img, function (elementSource) {
        $this.css('background-image', 'url(' + elementSource + ')');
      });
    });
  }

  if ('objectFit' in document.documentElement.style === false) {
    $('html').addClass('no-objectfit');
    $(window).resize(function () {
      setBgImage();
    });
    setBgImage();
  }
});
"use strict";

//make iframe videos responsive
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('iframe[src*="youtube.com"], iframe[data-src*="youtube.com"], iframe[src*="vimeo.com"], iframe[data-src*="vimeo.com"]').forEach(function (iframe) {
    if (!iframe.parentElement.classList.contains('videowrapper')) {
      wrap(iframe).classList.add('videowrapper');
    }
  });
});
"use strict";

/*------- Core Functions --------*/
//wrap function
function wrap(el, wrapper) {
  if (wrapper === undefined) {
    wrapper = document.createElement('div');
  }

  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
  return wrapper;
} //debounce to slow down an event that users window size or the like
//debounce will wait till the window is resized and then run


function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
        args = arguments;

    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
} //throttle will run every few milliseconds as opposed to every millisecond


function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last, deferTimer;
  return function () {
    var context = scope || this;
    var now = +new Date(),
        args = arguments;

    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
} //slide elements


var ignSlideTimer;

function ignSlidePropertyReset(target) {
  clearTimeout(ignSlideTimer);
  target.style.removeProperty('height');
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  target.style.removeProperty('overflow');
  target.style.removeProperty('transition-duration');
  target.style.removeProperty('transition-property');
}

function ignSlideUp(target) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;
  //add transition and ready the properties
  ignSlidePropertyReset(target);
  target.style.height = target.offsetHeight + 'px';
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 's';
  target.style.overflow = 'hidden';
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginBottom = 0;
  target.style.marginTop = 0;
  setTimeout(function () {
    target.style.height = 0;
  }, 100);
  ignSlideTimer = setTimeout(function () {
    target.style.display = 'none';
    ignSlidePropertyReset(target);
  }, duration * 1000);
}
/**
 *
 * @param target
 * @param duration
 *
 * Style element as it should show then set it to display none (or have it get display none from slide up or something else)
 */


function ignSlideDown(target) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;
  //remove any inline properties for display and padding and margins that might be there, may have pressed this while it was sliding down
  ignSlidePropertyReset(target); //save original margins, check whether we are setting to block or some other (flex, inline-block)...

  var display = window.getComputedStyle(target).display;
  var padding = window.getComputedStyle(target).padding;
  var margin = window.getComputedStyle(target).margin; //if its none make it a block element then grab its height quickly

  if (display === 'none') {
    display = 'block';
  }

  target.style.display = display; //might be inline-block...
  //show element for s milisecond and grab height

  target.style.height = 'auto';
  target.style.overflow = 'hidden';
  var height = target.offsetHeight; //grab height while auto
  //set any other problematic property to 0

  target.style.transitionProperty = 'none';
  target.style.height = '0px'; //set height back to 0

  target.style.paddingTop = '0px';
  target.style.paddingBottom = '0px';
  target.style.marginTop = '0px';
  target.style.marginBottom = '0px'; //set display to show, but padding and height to 0 right away

  setTimeout(function () {
    //turn on  transitions adn animate properties back to normal
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + 's';
    target.style.padding = padding;
    target.style.height = height + 'px';
    target.style.margin = margin;
  }, 100); //after it slides open remove properties

  ignSlideTimer = setTimeout(function () {
    ignSlidePropertyReset(target);
  }, duration * 1000);
}

function ignSlideToggle(target) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  if (window.getComputedStyle(target).display === 'none') {
    return ignSlideDown(target, duration);
  } else {
    return ignSlideUp(target, duration);
  }
}
"use strict";

document.addEventListener('DOMContentLoaded', function () {
  //move the header above the article when header-above is found
  var headerAbove = document.querySelector('.header-above');

  if (headerAbove !== null) {
    document.querySelectorAll('.entry-header, .page-header').forEach(function (header) {
      headerAbove.parentElement.prepend(header);
      header.classList.add('header-moved'); //might be useful for someone
    });
  } //when a secondary is used, a sidebar is shown, on load we do a few things to smooth the transition of the header


  var sidebar = document.querySelector('#secondary');

  if (sidebar !== null) {
    sidebar.innerHTML = sidebar.innerHTML.trim(); //if moving stuff in and out its good to remove extra space so :empty works

    var sidebarTemplate = document.querySelector('.sidebar-template');
    sidebarTemplate.classList.add('active');
  }
});
"use strict";

var scrollEvent = new Event('afterScroll', {
  bubbles: true
}); //bubble allows for delegation on body

/**
 * runs when an anchor is clicked or the page loads with an anchor
 * the item we are scrolling to can have an offset
 * @param element
 */

function scrolltoHash(element) {
  var offset = element.dataset.offset || 'start'; //if the offset is a string 'start, center, or end'

  if (isNaN(parseInt(offset))) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: offset
    });
  } else {
    //from top scroll with offset
    var fromTop = window.pageYOffset + element.getBoundingClientRect().top + parseInt(offset);
    window.scroll({
      behavior: 'smooth',
      top: fromTop
    });
  } //fire some more events


  element.dispatchEvent(scrollEvent);
}

document.addEventListener('DOMContentLoaded', function () {
  if (location.hash) {
    scrolltoHash(document.querySelector(location.hash));
  }

  document.body.addEventListener('click', function (e) {
    var item = e.target.closest('a[href^="#"]');

    if (item) {
      var itemHash = item.getAttribute('href');

      if (itemHash !== '#' && itemHash !== '#0') {
        e.preventDefault();
        scrolltoHash(document.querySelector(itemHash));
      }
    }
  });
});
document.addEventListener('afterScroll', function (e) {//run an event after scroll begins
});
"use strict";

var scrollMagicController = ''; //setup scroller function

/**
 * element can have these data attributes:
 * data-scrollanimation = a class to add to this element on scroll
 * data-scrolltrigger = the element that triggers the scene to start
 * data-scrollhook = onEnter, onLeave, default is center
 * data-scrolloffset = offset from scrollhook on trigger element
 * data-scrollduration = how long it should last. if not set, 0  is used and that means it doesnt reset until you scroll up.
 * data-scrollscrub = tweens between two classes as you scroll. tween expects a duration, else duration will be 100
 *
 */

function runScrollerAttributes(element) {
  //this function can be run on an alement even after load and they will be added to scrollMagicController
  //scrollmagic must be loaded
  if ('undefined' != typeof ScrollMagic && element.hasAttribute('data-scrollanimation')) {
    //scroll animation attributes
    var animationClass = element.dataset.scrollanimation,
        triggerHook = element.dataset.scrollhook || 'center',
        offset = element.dataset.offset || 0,
        triggerElement = element.dataset.scrolltrigger || element,
        duration = element.dataset.duration || 0,
        tween = element.dataset.scrollscrub,
        reverse = element.dataset.reverse || true;
    scene = ''; //if animation has word up or down, its probably an animation that moves it up or down,
    //so make sure trigger element

    if (-1 !== animationClass.toLowerCase().indexOf('up') || -1 !== animationClass.toLowerCase().indexOf('down')) {
      //get parent element and make that the trigger, but use an offset from current element
      if (triggerElement === element) {
        triggerElement = element.parentElement;
        offset = element.offsetTop - triggerElement.offsetTop + parseInt(offset);
      }

      triggerHook = 'onEnter';
    } //if fixed at top, wrap in div


    if (element.getAttribute('data-scrollanimation') === 'fixed-at-top') {
      var wrappedElement = wrap(element, document.createElement('div'));
      wrappedElement.classList.add('fixed-holder');
      triggerHook = 'onLeave';
      triggerElement = element.parentElement;
    } //if scrollscrub exists used tweenmax


    if (tween !== undefined) {
      if (!duration) {
        duration = 100;
      }

      tween = TweenMax.to(element, .65, {
        className: '+=' + animationClass
      }); //finally output the scene

      scene = new ScrollMagic.Scene({
        triggerElement: triggerElement,
        offset: offset,
        triggerHook: triggerHook,
        duration: duration,
        reverse: reverse
      }).setTween(tween).addTo(scrollMagicController) // .addIndicators()
      ;
    } else {
      scene = new ScrollMagic.Scene({
        triggerElement: triggerElement,
        offset: offset,
        triggerHook: triggerHook,
        duration: duration,
        reverse: reverse
      }).on('enter leave', function () {
        //instead of using toggle class we can use these events of on enter and leave and toggle class at both times
        element.classList.toggle(animationClass);
        element.classList.toggle('active'); //if fixed at top set height for spacer and width

        if (element.getAttribute('data-scrollanimation') === 'fixed-at-top') {
          //making fixed item have a set width matching parent
          element.style.width = element.parentElement.clientWidth + 'px';
          element.style.left = element.parentElement.offsetLeft + 'px';
        }
      }).addTo(scrollMagicController) //.setClassToggle(element, animationClass + ' active').addTo(scrollMagicController)
      // .addIndicators()
      ;
    } //good for knowing when its been loaded


    document.body.classList.add('scrollmagic-loaded');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  /*------- Scroll Magic Events Init --------*/
  if ('undefined' != typeof ScrollMagic) {
    scrollMagicController = new ScrollMagic.Controller();
    document.querySelectorAll('[data-scrollanimation]').forEach(function (element) {
      runScrollerAttributes(element);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy5qcyIsImljb25zLmpzIiwiam9qb2VzLmpzIiwibmF2aWdhdGlvbi5qcyIsIm9iamVjdGZpdEZhbGxiYWNrLmpzIiwicmVzcG9uc2l2ZS1pZnJhbWUuanMiLCJzZXR1cC5qcyIsInNpZGViYXIuanMiLCJzbW9vdGgtc2Nyb2xsLmpzIiwic2Nyb2xsbWFnaWMvX3Njcm9sbG1hZ2ljLmpzIl0sIm5hbWVzIjpbIm1lbnVCdXR0b25zIiwicGxhY2VNZW51QnV0dG9ucyIsIiRzaXRlVG9wSGVpZ2h0IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY2xpZW50SGVpZ2h0IiwibGVuZ3RoIiwiZm9yRWFjaCIsImJ1dHRvbiIsInN0eWxlIiwiaGVpZ2h0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImRvY3VtZW50RWxlbWVudCIsImNsYXNzTmFtZSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ0b2dnbGVFdmVudCIsImlzSUUxMSIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50IiwiRXZlbnQiLCJidWJibGVzIiwiYnV0dG9ucyIsInNldEF0dHJpYnV0ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiYm9keSIsImUiLCJpdGVtIiwidGFyZ2V0IiwiY2xvc2VzdCIsIiRkb0RlZmF1bHQiLCJnZXRBdHRyaWJ1dGUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInJhZGlvU2VsZWN0b3IiLCJyYWRpb1NlbGVjdG9ycyIsInJhZGlvSXRlbSIsInRvZ2dsZUl0ZW0iLCJzd2l0Y2hJdGVtIiwiZm9yY2VkU3RhdGUiLCJhZGQiLCJyZW1vdmUiLCJ0b2dnbGUiLCJpc1RvZ2dsZWQiLCIkY2xhc3MiLCIkdGFyZ2V0IiwidGFyZ2V0SXRlbSIsImRhdGFzZXQiLCJzbGlkZSIsInVuZGVmaW5lZCIsInNsaWRlVGltZSIsInBhcnNlRmxvYXQiLCJpZ25TbGlkZURvd24iLCJpZ25TbGlkZVVwIiwiZGlzcGF0Y2hFdmVudCIsIm1vdmVkSWQiLCJtb3ZlSXRlbXMiLCJ3aW5kb3dXaWR0aCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCIkbW92ZUl0ZW1zIiwibW92ZUF0IiwiZGVzdGluYXRpb24iLCJzb3VyY2UiLCJzdGFydHNXaXRoIiwiY3NzVmFycyIsImdldENvbXB1dGVkU3R5bGUiLCJwYXJzZUludCIsImdldFByb3BlcnR5VmFsdWUiLCJzb3VyY2VFbGVtIiwicGFyZW50RWxlbWVudCIsImlkIiwiaGFzQXR0cmlidXRlIiwiaW5zZXJ0QmVmb3JlIiwiY2hpbGRyZW4iLCJhcHBlbmRDaGlsZCIsImZpeGVkIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJ0aHJvdHRsZSIsIkV2ZW50RmluaXNoZWQiLCJpc0hpZ2hEZW5zaXR5IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJmaWxlRXhpc3RzIiwiaW1hZ2VfdXJsIiwiaHR0cCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNlbmQiLCJzdGF0dXMiLCJyZXRpbmFJbWFnZSIsImltYWdlMngiLCJoaWdoUmVzIiwiaW1hZ2UiLCJiYWNrZ3JvdW5kSW1hZ2UiLCJzbGljZSIsInJlcGxhY2UiLCJpY29uIiwiaWNvbkNsYXNzIiwiaWNvblN0cmluZyIsImluc2VydEFkamFjZW50SFRNTCIsIm15RnVuY3Rpb24iLCJkb3RzIiwiZ2V0RWxlbWVudEJ5SWQiLCJtb3JlVGV4dCIsImJ0blRleHQiLCJkaXNwbGF5IiwiaW5uZXJIVE1MIiwiZml4T2ZmU2NyZWVuTWVudSIsIm1lbnUiLCJvcGFjaXR5IiwicmlnaHRFZGdlIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicmlnaHQiLCJsZWZ0RWRnZSIsInZpZXdwb3J0IiwiY2xpZW50V2lkdGgiLCJsZWZ0Iiwib3BlbkNsb3NlTWVudSIsIm1lbnVCdXR0b24iLCJtZW51SXRlbSIsInN1Yk1lbnUiLCJvbmNlIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiY2xpY2siLCJldnQiLCJmbGV4RGlyZWN0aW9uIiwibGFzdFRhYmJlZEl0ZW0iLCJtZW51SXRlbUxpbmsiLCJjb2RlIiwia2V5Q29kZSIsIndoaWNoIiwiY29uc29sZSIsImxvZyIsIm1lbnVUb2dnbGUiLCJ0b3BOYXYiLCJwYWdlIiwiYXBwZW5kIiwiY2xvc2VBcHBNZW51IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImpRdWVyeSIsIiQiLCJuYXZpZ2F0aW9uTGkiLCJtaWRkbGUiLCJNYXRoIiwiZmxvb3IiLCJpbnNlcnRBZnRlciIsImZpbHRlciIsImNsb25lIiwiYXBwZW5kVG8iLCJpbWdDb250YWluZXIiLCJnZXRDdXJyZW50U3JjIiwiZWxlbWVudCIsImNiIiwiZ2V0U3JjIiwiSFRNTFBpY3R1cmVFbGVtZW50IiwicmVzcGltYWdlIiwiZWxlbWVudHMiLCJwaWN0dXJlZmlsbCIsInNyYyIsImN1cnJlbnRTcmMiLCJjb21wbGV0ZSIsInNldEJnSW1hZ2UiLCJlYWNoIiwiJHRoaXMiLCJpbWciLCJmaW5kIiwiZ2V0IiwiZWxlbWVudFNvdXJjZSIsImNzcyIsImFkZENsYXNzIiwicmVzaXplIiwiaWZyYW1lIiwid3JhcCIsImVsIiwid3JhcHBlciIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnROb2RlIiwiZGVib3VuY2UiLCJmdW5jIiwid2FpdCIsImltbWVkaWF0ZSIsInRpbWVvdXQiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImxhdGVyIiwiYXBwbHkiLCJjYWxsTm93IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImZuIiwidGhyZXNoaG9sZCIsInNjb3BlIiwibGFzdCIsImRlZmVyVGltZXIiLCJub3ciLCJEYXRlIiwiaWduU2xpZGVUaW1lciIsImlnblNsaWRlUHJvcGVydHlSZXNldCIsInJlbW92ZVByb3BlcnR5IiwiZHVyYXRpb24iLCJvZmZzZXRIZWlnaHQiLCJ0cmFuc2l0aW9uUHJvcGVydHkiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJvdmVyZmxvdyIsInBhZGRpbmdUb3AiLCJwYWRkaW5nQm90dG9tIiwibWFyZ2luQm90dG9tIiwibWFyZ2luVG9wIiwicGFkZGluZyIsIm1hcmdpbiIsImlnblNsaWRlVG9nZ2xlIiwiaGVhZGVyQWJvdmUiLCJoZWFkZXIiLCJwcmVwZW5kIiwic2lkZWJhciIsInRyaW0iLCJzaWRlYmFyVGVtcGxhdGUiLCJzY3JvbGxFdmVudCIsInNjcm9sbHRvSGFzaCIsIm9mZnNldCIsImlzTmFOIiwic2Nyb2xsSW50b1ZpZXciLCJiZWhhdmlvciIsImJsb2NrIiwiZnJvbVRvcCIsInBhZ2VZT2Zmc2V0IiwidG9wIiwic2Nyb2xsIiwibG9jYXRpb24iLCJoYXNoIiwiaXRlbUhhc2giLCJzY3JvbGxNYWdpY0NvbnRyb2xsZXIiLCJydW5TY3JvbGxlckF0dHJpYnV0ZXMiLCJTY3JvbGxNYWdpYyIsImFuaW1hdGlvbkNsYXNzIiwic2Nyb2xsYW5pbWF0aW9uIiwidHJpZ2dlckhvb2siLCJzY3JvbGxob29rIiwidHJpZ2dlckVsZW1lbnQiLCJzY3JvbGx0cmlnZ2VyIiwidHdlZW4iLCJzY3JvbGxzY3J1YiIsInJldmVyc2UiLCJzY2VuZSIsInRvTG93ZXJDYXNlIiwiaW5kZXhPZiIsIm9mZnNldFRvcCIsIndyYXBwZWRFbGVtZW50IiwiVHdlZW5NYXgiLCJ0byIsIlNjZW5lIiwic2V0VHdlZW4iLCJhZGRUbyIsIm9uIiwid2lkdGgiLCJvZmZzZXRMZWZ0IiwiQ29udHJvbGxlciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUlBOzs7OztBQU1BLElBQUlBLFdBQVcsR0FBRyxFQUFsQjs7QUFFQSxTQUFTQyxnQkFBVCxHQUE0QjtBQUMzQixNQUFJQyxjQUFjLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixXQUF2QixDQUFyQjs7QUFFQSxNQUFHRixjQUFjLElBQUksSUFBckIsRUFBMEI7QUFDekJBLElBQUFBLGNBQWMsR0FBR0EsY0FBYyxDQUFDRyxZQUFoQztBQUNBLEdBTDBCLENBTzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUEsTUFBSUwsV0FBVyxDQUFDTSxNQUFoQixFQUF3QjtBQUN2Qk4sSUFBQUEsV0FBVyxDQUFDTyxPQUFaLENBQW9CLFVBQUFDLE1BQU0sRUFBSTtBQUM3QkEs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QUFBQSxPQUFPLENBQUMvSSxLQUFSLENBQWM0RyxJQUFkLEdBQXFCbUMsT0FBTyxDQUFDbEYsYUFBUixDQUFzQjJMLFVBQXRCLEdBQW1DLElBQXhEO0FBRUE7QUFDRCxPQW5CTyxFQW1CTEgsS0FuQkssQ0FtQkNyQixxQkFuQkQsQ0FBUixDQW9CQTtBQUNBO0FBckJBO0FBdUJBLEtBOUVxRixDQWdGdEY7OztBQUNBdE8sSUFBQUEsUUFBUSxDQUFDc0IsSUFBVCxDQUFjRixTQUFkLENBQXdCaUIsR0FBeEIsQ0FBNEIsb0JBQTVCO0FBRUE7QUFDRDs7QUFHRHJDLFFBQVEsQ0FBQ1EsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVk7QUFDekQ7QUFDQSxNQUFJLGVBQWUsT0FBT2dPLFdBQTFCLEVBQXVDO0FBQ3RDRixJQUFBQSxxQkFBcUIsR0FBRyxJQUFJRSxXQUFXLENBQUN1QixVQUFoQixFQUF4QjtBQUNBL1AsSUFBQUEsUUFBUSxDQUFDVyxnQkFBVCxDQUEwQix3QkFBMUIsRUFBb0RQLE9BQXBELENBQTRELFVBQUNpSixPQUFELEVBQWE7QUFDeEVrRixNQUFBQSxxQkFBcUIsQ0FBQ2xGLE9BQUQsQ0FBckI7QUFDQSxLQUZEO0FBR0E7QUFDRCxDQVJEIiwiZmlsZSI6ImN1c3RvbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQWRkaW5nIHNvbWUgZ2xvYmFsIGV2ZW50cyBhbmQgZnVuY3Rpb25zIHVzZXJzIGNhbiB1c2UgdmlhIGRhdGEgYXR0cmlidXRlc1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vKipcbiAqIHJlc2l6ZSBtZW51IGJ1dHRvbnMgb24gbG9hZC4gYWxzbyBydW5zIG9uIHJlc2l6ZS5cbiAqIG1lbnUgYnV0dG9uIGlzIG5vdCBpbnNpZGUgc2l0ZS10b3AgZm9yIHZhcmlvdXMgcmVhc29ucyAod2UgZG9udCB3YW50IHggdG8gYmUgaW5zaWRlIG9yIHdoZW4gbWVudSBvcGVucyB0aGUgZXggaXMgdWluZGVybmVhdGguXG4gKiBzbyB3ZSB1c2UgdGhpcyBmdW5jdGlvbiB0byBtYXRjaCB0aGUgc2l0ZSAtdG9wIGhlaWdodCBhbmQgY2VudGVyIGl0IGFzIGlmIGl0IHdhcyBpbnNpZGVcbiAqL1xuXG5sZXQgbWVudUJ1dHRvbnMgPSAnJztcblxuZnVuY3Rpb24gcGxhY2VNZW51QnV0dG9ucygpIHtcblx0bGV0ICRzaXRlVG9wSGVpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpdGUtdG9wJyk7XG5cblx0aWYoJHNpdGVUb3BIZWlnaHQgIT0gbnVsbCl7XG5cdFx0JHNpdGVUb3BIZWlnaHQgPSAkc2l0ZVRvcEhlaWdodC5jbGllbnRIZWlnaHQ7XG5cdH1cblxuXHQvLyBsZXQgYWRtaW5iYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd3BhZG1pbmJhcicpO1xuXHQvLyBsZXQgYWRtaW5iYXJIZWlnaHQgPSAwO1xuXHQvL1xuXHQvLyBpZiAoYWRtaW5iYXIgIT09IG51bGwpIHtcblx0Ly8gXHRhZG1pbmJhckhlaWdodCA9IGFkbWluYmFyLmNsaWVudEhlaWdodDtcblx0Ly8gfVxuXG5cdGlmIChtZW51QnV0dG9ucy5sZW5ndGgpIHtcblx0XHRtZW51QnV0dG9ucy5mb3JFYWNoKGJ1dHRvbiA9PiB7XG5cdFx0XHRidXR0b24uc3R5bGUuaGVpZ2h0ID0gJHNpdGVUb3BIZWlnaHQgKyAncHgnO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgSUdOIEV2ZW50c1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuXG5cdC8qLS0tLS0tLSBBZGQgdG91Y2ggY2xhc3NlcyBvciBub3QgLS0tLS0tLS0qL1xuXHRpZiAoIShcIm9udG91Y2hzdGFydFwiIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkpIHtcblx0XHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIG5vLXRvdWNoLWRldmljZVwiO1xuXHR9IGVsc2Uge1xuXHRcdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc05hbWUgKz0gXCIgdG91Y2gtZGV2aWNlXCI7XG5cdH1cblxuXHQvKi0tLS0tLS0gbWVudSBidXR0b25zIC0tLS0tLS0tKi9cblx0Ly9pZiB0aGUgbWVudSBidXR0b24gaXMgb3V0c2lkZSBzaXRlLXRvcC4gZ2V0IGJvdGggYnV0dG9ucyBmb3IgY2VudGVyaW5nIGJvdGguXG5cdGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1tZW51JykpIHtcblx0XHRtZW51QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wYW5lbC1sZWZ0LXRvZ2dsZSwgLnBhbmVsLXJpZ2h0LXRvZ2dsZScpO1xuXHR9IGVsc2Uge1xuXHRcdC8vb3RoZXJ3aXNlIHRoZSBtZW51IGJ1dHRvbiBkb2VzIG5vdCBuZWVkIHRvIGJlIGNlbnRlcmVkIGJlY2F1c2UgaXRzIHBhcnQgb2YgdGhlIGFwcCBtZW51IGFuZCBtb3Zlcy4gKG1vdmVkIGluIG5hdmlnYXRpb24uanMpXG5cdFx0bWVudUJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucGFuZWwtcmlnaHQtdG9nZ2xlJyk7XG5cdH1cblx0Ly93ZSBydW4gbWVudSBidXR0b24gZnVuY3Rpb24gYmVsb3cgaW4gcmVzaXplIGV2ZW50XG5cblxuXHQvKi0tLS0tLS0gVG9nZ2xlIEJ1dHRvbnMgLS0tLS0tLS0qL1xuXG5cdC8vdHJpZ2dlciBvcHRpb25hbCBhZnRlclRvZ2dsZSBldmVudFxuXHQvL2FkZGluZyBuZXcgY3VzdG9tIGV2ZW50IGZvciBhZnRlciB0aGUgZWxlbWVudCBpcyB0b2dnbGVkXG5cdGxldCB0b2dnbGVFdmVudCA9IG51bGw7XG5cdGlmIChpc0lFMTEpIHtcblx0XHR0b2dnbGVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXG5cdFx0Ly8gRGVmaW5lIHRoYXQgdGhlIGV2ZW50IG5hbWUgaXMgJ2J1aWxkJy5cblx0XHR0b2dnbGVFdmVudC5pbml0RXZlbnQoJ2FmdGVyVG9nZ2xlJywgdHJ1ZSwgdHJ1ZSk7XG5cblx0fSBlbHNlIHtcblx0XHR0b2dnbGVFdmVudCA9IG5ldyBFdmVudCgnYWZ0ZXJUb2dnbGUnLCB7YnViYmxlczogdHJ1ZX0pOyAvL2J1YmJsZSBhbGxvd3MgZm9yIGRlbGVnYXRpb24gb24gYm9keVxuXHR9XG5cblxuXHQvL2FkZCBhcmlhIHRvIGJ1dHRvbnMgY3VycmVudGx5IG9uIHBhZ2Vcblx0bGV0IGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10b2dnbGVdJyk7XG5cdGJ1dHRvbnMuZm9yRWFjaChidXR0b24gPT4ge1xuXHRcdGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnc3dpdGNoJyk7XG5cdFx0YnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1jaGVja2VkJywgYnV0dG9uLmNsYXNzTGlzdC5jb250YWlucygndG9nZ2xlZC1vbicpID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cblx0fSk7XG5cblxuXHQvL3RvZ2dsaW5nIHRoZSBidXR0b25zIHdpdGggZGVsZWdhdGlvbiBjbGlja1xuXHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG5cblx0XHRsZXQgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLXRvZ2dsZV0nKTtcblxuXHRcdGlmIChpdGVtKSB7XG5cblx0XHRcdGxldCAkZG9EZWZhdWx0ID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVmYXVsdCcpO1xuXHRcdFx0Ly9ub3JtYWxseSB3ZSBwcmV2ZW50IGRlZmF1bHQgdW5sZXNzIHNvbWVvbmUgYWRkIGRhdGEtZGVmYXVsdFxuXHRcdFx0aWYgKG51bGwgPT09ICRkb0RlZmF1bHQpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL2lmIGRhdGEtcmFkaW8gaXMgZm91bmQsIG9ubHkgb25lIGNhbiBiZSBzZWxlY3RlZCBhdCBhIHRpbWUuXG5cdFx0XHQvLyB1bnRvZ2dsZXMgYW55IG90aGVyIGl0ZW0gd2l0aCBzYW1lIHJhZGlvIHZhbHVlXG5cdFx0XHQvL3JhZGlvIGl0ZW1zIGNhbm5vdCBiZSB1bnRvZ2dsZWQgdW50aWwgYW5vdGhlciBpdGVtIGlzIGNsaWNrZWRcblx0XHRcdGxldCByYWRpb1NlbGVjdG9yID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmFkaW8nKTtcblxuXG5cdFx0XHRpZiAocmFkaW9TZWxlY3RvciAhPT0gbnVsbCkge1xuXHRcdFx0XHRsZXQgcmFkaW9TZWxlY3RvcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1yYWRpbz1cIiR7cmFkaW9TZWxlY3Rvcn1cIl1gKTtcblxuXHRcdFx0XHRyYWRpb1NlbGVjdG9ycy5mb3JFYWNoKHJhZGlvSXRlbSA9PiB7XG5cdFx0XHRcdFx0aWYgKHJhZGlvSXRlbSAhPT0gaXRlbSAmJiByYWRpb0l0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCd0b2dnbGVkLW9uJykpIHtcblx0XHRcdFx0XHRcdHRvZ2dsZUl0ZW0ocmFkaW9JdGVtKTsgLy90b2dnbGUgYWxsIG90aGVyIHJhZGlvIGl0ZW1zIG9mZiB3aGVuIHRoaXMgb25lIGlzIGJlaW5nIHR1cm5lZCBvblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vaWYgaXRlbSBoYXMgZGF0YS1zd2l0Y2ggaXQgY2FuIG9ubHkgYmUgdHVybmVkIG9uIG9yIG9mZiBidXQgbm90IGJvdGggYnkgdGhpcyBidXR0b24gYmFzZWQgb24gdmFsdWUgb2YgZGF0YS1zd2l0Y2ggKGl0cyBlaXRoZXIgb24gb3Igb2ZmKVxuXHRcdFx0bGV0IHN3aXRjaEl0ZW0gPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1zd2l0Y2gnKTtcblxuXHRcdFx0Ly9maW5hbGx5IHRvZ2dsZSB0aGUgY2xpY2tlZCBpdGVtLiBzb21lIHR5cGVzIG9mIGl0ZW1zIGNhbm5vdCBiZSB1bnRvZ2dsZWQgbGlrZSByYWRpbyBvciBhbiBvbiBzd2l0Y2hcblx0XHRcdGlmIChyYWRpb1NlbGVjdG9yICE9PSBudWxsKSB7XG5cdFx0XHRcdHRvZ2dsZUl0ZW0oaXRlbSwgJ29uJyk7IC8vdGhlIGl0ZW0gY2xpY2tlZCBvbiBjYW5ub3QgYmUgdW5jbGlja2VkIHVudGlsIGFub3RoZXIgaXRlbSBpcyBwcmVzc2VkXG5cdFx0XHR9IGVsc2UgaWYgKHN3aXRjaEl0ZW0gIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKHN3aXRjaEl0ZW0gPT09ICdvbicpIHtcblx0XHRcdFx0XHR0b2dnbGVJdGVtKGl0ZW0sICdvbicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRvZ2dsZUl0ZW0oaXRlbSwgJ29mZicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0b2dnbGVJdGVtKGl0ZW0pOyAvL25vcm1hbCByZWd1bGFyIHRvZ2dsZSBjYW4gdHVybiBpdHNlbGYgb24gb3Igb2ZmXG5cdFx0XHR9XG5cblx0XHR9IC8vZW5kIGlmIGl0ZW0gZm91bmRcblx0fSk7XG5cblx0Ly9hY3R1YWwgdG9nZ2xlIG9mIGFuIGl0ZW0gYW5kIGFkZCBjbGFzcyB0b2dnbGVkLW9uIGFuZCBhbnkgb3RoZXIgY2xhc3NlcyBuZWVkZWQuIEFsc28gZG8gYSBzbGlkZSBpZiBuZWNlc3Nhcnlcblx0ZnVuY3Rpb24gdG9nZ2xlSXRlbShpdGVtLCBmb3JjZWRTdGF0ZSA9ICdub25lJykge1xuXG5cdFx0Ly90b2dnbGUgaXRlbVxuXHRcdGlmIChmb3JjZWRTdGF0ZSA9PT0gJ29uJykge1xuXHRcdFx0aXRlbS5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkLW9uJyk7IC8vcmFkaW8gb3IgZGF0YS1zd2l0Y2ggb2Ygb24gd2lsbCBhbHdheXMgdG9nZ2xlLW9uXG5cdFx0fSBlbHNlIGlmIChmb3JjZWRTdGF0ZSA9PT0gJ29mZicpIHtcblx0XHRcdGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgndG9nZ2xlZC1vbicpOyAvL2RhdGEtc3dpdGNoIG9mIG9mZiB3aWxsIGFsd2F5cyB0b2dnbGUgb2ZmXG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlZC1vbicpOyAvL2Jhc2ljIGRhdGEgdG9nZ2xlIGl0ZW1cblx0XHR9XG5cblx0XHQvL2lzIGl0ZW0gdG9nZ2xlZD8gdXNlZCBmb3IgdGhlIHJlc3Qgb2YgdGhpcyBmdW5jdGlvbiB0byB0b2dnbGUgYW5vdGhlciB0YXJnZXQgaWYgbmVlZGVkLlxuXHRcdGxldCBpc1RvZ2dsZWQgPSBpdGVtLmNsYXNzTGlzdC5jb250YWlucygndG9nZ2xlZC1vbicpO1xuXG5cdFx0aXRlbS5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBpc1RvZ2dsZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcblxuXHRcdC8vZ2V0IGNsYXNzIHRvIGFkZCB0byB0aGlzIGl0ZW0gb3IgYW5vdGhlclxuXHRcdGxldCAkY2xhc3MgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSxcblx0XHRcdCR0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGl0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpKTtcblxuXHRcdGlmICgkY2xhc3MgPT09IG51bGwgfHwgISRjbGFzcykge1xuXHRcdFx0JGNsYXNzID0gJ3RvZ2dsZWQtb24nOyAvL2RlZmF1bHQgY2xhc3MgYWRkZWQgaXMgdG9nZ2xlZC1vblxuXHRcdH1cblx0XHQvL3NwZWNpYWwgY2xhc3MgYWRkZWQgdG8gYW5vdGhlciBpdGVtXG5cdFx0aWYgKCR0YXJnZXQubGVuZ3RoKSB7XG5cdFx0XHQkdGFyZ2V0LmZvckVhY2godGFyZ2V0SXRlbSA9PiB7XG5cdFx0XHRcdGlmIChpc1RvZ2dsZWQpIHtcblx0XHRcdFx0XHR0YXJnZXRJdGVtLmNsYXNzTGlzdC5hZGQoJGNsYXNzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0YXJnZXRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJGNsYXNzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhcmdldEl0ZW0uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgaXNUb2dnbGVkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cblx0XHRcdFx0Ly9kYXRhIHNsaWRlIG9wZW4gb3IgY2xvc2VkXG5cdFx0XHRcdGlmICh0YXJnZXRJdGVtLmRhdGFzZXQuc2xpZGUgIT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRcdFx0bGV0IHNsaWRlVGltZSA9ICh0YXJnZXRJdGVtLmRhdGFzZXQuc2xpZGUpID8gcGFyc2VGbG9hdCh0YXJnZXRJdGVtLmRhdGFzZXQuc2xpZGUpIDogLjU7XG5cblx0XHRcdFx0XHRpZiAoaXNUb2dnbGVkKSB7XG5cdFx0XHRcdFx0XHRpZ25TbGlkZURvd24odGFyZ2V0SXRlbSwgc2xpZGVUaW1lKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWduU2xpZGVVcCh0YXJnZXRJdGVtLCBzbGlkZVRpbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vYWxsb3cgZXZlbnQgdG8gaGFwcGVuIGFmdGVyIGNsaWNrIGZvciB0aGUgdGFyZ2V0ZWQgaXRlbVxuXHRcdFx0XHR0YXJnZXRJdGVtLmRpc3BhdGNoRXZlbnQodG9nZ2xlRXZlbnQpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHsgLy9hcHBsaWVzIGNsYXNzIHRvIHRoZSBjbGlja2VkIGl0ZW0sIHRoZXJlIGlzIG5vIHRhcmdldFxuXHRcdFx0aWYgKCRjbGFzcyAhPT0gJ3RvZ2dsZWQtb24nKSB7IC8vYWRkIGNsYXNzIHRvIGNsaWNrZWQgaXRlbSBpZiBpdHMgbm90IHNldCB0byBiZSB0b2dnbGVkLW9uXG5cdFx0XHRcdGlmIChpc1RvZ2dsZWQpIHtcblx0XHRcdFx0XHRpdGVtLmNsYXNzTGlzdC50b2dnbGUoJGNsYXNzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJGNsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vdHJpZ2dlciBvcHRpb25hbCBhZnRlclRvZ2dsZSBldmVudC4gY29udGludWUgdGhlIGNsaWNrIGV2ZW50IGZvciBjdXN0b21pemVkIHN0dWZmXG5cdFx0aXRlbS5kaXNwYXRjaEV2ZW50KHRvZ2dsZUV2ZW50KTtcblxuXHR9XG5cblxuXHQvKi0tLS0tLS0gTW92aW5nIGl0ZW1zIEV2ZW50IGFzIHdlbGwgYXMgYWxsIHJlc2l6aW5nIC0tLS0tLS0tKi9cblx0Ly9vbiBXaW5kb3cgcmVzaXplIHdlIGNhbiBtb3ZlIGl0ZW1zIHRvIGFuZCBmcm9tIGRpdnMgd2l0aCBkYXRhLW1vdmV0bz1cInRoZSBkZXN0aW5hdGlvblwiXG5cdC8vaXQgd2lsbCBtb3ZlIHRoZXJlIHdoZW4gdGhlIHNpdGUgcmVhY2hlcyBzbWFsbGVyIHRoYW4gYSBzaXplIGRlZmF1bHRlZCB0byAxMDMwIG9yIHNldCB0aGF0IHdpdGggZGF0YS1tb3ZlYXRcblx0Ly90aGUgd2hvbGUgZGl2LCBpbmNsdWRpbmcgdGhlIGRhdGEgYXR0IG1vdmV0byBtb3ZlcyBiYWNrIGFuZCBmb3J0aFxuXHRsZXQgbW92ZWRJZCA9IDA7XG5cblx0ZnVuY3Rpb24gbW92ZUl0ZW1zKCkge1xuXG5cblx0XHRsZXQgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHRsZXQgJG1vdmVJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW1vdmV0b10nKTtcblxuXHRcdCRtb3ZlSXRlbXMuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdGxldCBtb3ZlQXQgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1tb3ZlYXQnKSxcblx0XHRcdFx0ZGVzdGluYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGl0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW1vdmV0bycpKSxcblx0XHRcdFx0c291cmNlID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW92ZWZyb20nKTtcblxuXHRcdFx0bW92ZUF0ID0gbW92ZUF0ID8gbW92ZUF0IDogMTAzMDtcblxuXHRcdFx0aWYgKG1vdmVBdC5zdGFydHNXaXRoKCctLScpKSB7XG5cdFx0XHRcdGlmIChpc0lFMTEpIHtcblx0XHRcdFx0XHRtb3ZlQXQgPSAxMDMwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCBjc3NWYXJzID0gZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KTsgLy9nZXQgY3NzIHZhcmlhYmxlc1xuXHRcdFx0XHRcdG1vdmVBdCA9IHBhcnNlSW50KGNzc1ZhcnMuZ2V0UHJvcGVydHlWYWx1ZShtb3ZlQXQpLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0XHRpZiAoIWRlc3RpbmF0aW9uKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly9pZiBubyBkYXRhIG1vdmVmcm9tIGlzIGZvdW5kIGFkZCBvbmUgdG8gcGFyZW50IHNvIHdlIGNhbiBtb3ZlIGl0ZW1zIGJhY2sgaW4uIG5vdyB0aGV5IGdvIGJhY2sgYW5kIGZvcnRoXG5cdFx0XHRpZiAoIXNvdXJjZSkge1xuXHRcdFx0XHRsZXQgc291cmNlRWxlbSA9IGl0ZW0ucGFyZW50RWxlbWVudC5pZDtcblxuXHRcdFx0XHQvL2lmIHBhcmVudCBoYXMgbm8gaWQgYXR0ciwgYWRkIG9uZSB3aXRoIGEgbnVtYmVyIHNvIGl0cyB1bmlxdWVcblx0XHRcdFx0aWYgKCFzb3VyY2VFbGVtKSB7XG5cdFx0XHRcdFx0aXRlbS5wYXJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAnbW92ZS0nICsgbW92ZWRJZCk7XG5cdFx0XHRcdFx0bW92ZWRJZCsrO1xuXHRcdFx0XHRcdHNvdXJjZUVsZW0gPSBpdGVtLnBhcmVudEVsZW1lbnQuaWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpdGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1tb3ZlZnJvbScsICcjJyArIHNvdXJjZUVsZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHRzb3VyY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGl0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW1vdmVmcm9tJykpO1xuXG5cdFx0XHQvL2lmIHRoZSBzY3JlZW4gaXMgc21hbGxlciB0aGFuIG1vdmVBdCAoMTAzMCksIG1vdmUgdG8gZGVzdGluYXRpb25cblx0XHRcdGlmICh3aW5kb3dXaWR0aCA8IG1vdmVBdCB8fCBtb3ZlQXQgPT0gMCkge1xuXHRcdFx0XHQvL25vIG5lZWQgdG8gbW92ZSBpZiBpdHMgYWxyZWFkeSB0aGVyZS4uLlxuXHRcdFx0XHRpZiAoIWRlc3RpbmF0aW9uLmNvbnRhaW5zKGl0ZW0pKSB7XG5cdFx0XHRcdFx0aWYgKGl0ZW0uaGFzQXR0cmlidXRlKCdkYXRhLW1vdmV0by1wb3MnKSkge1xuXHRcdFx0XHRcdFx0ZGVzdGluYXRpb24uaW5zZXJ0QmVmb3JlKGl0ZW0sIGRlc3RpbmF0aW9uLmNoaWxkcmVuW2l0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW1vdmV0by1wb3MnKV0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkZXN0aW5hdGlvbi5hcHBlbmRDaGlsZChpdGVtKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghc291cmNlLmNvbnRhaW5zKGl0ZW0pKSB7XG5cdFx0XHRcdFx0aWYgKGl0ZW0uaGFzQXR0cmlidXRlKCdkYXRhLW1vdmVmcm9tLXBvcycpKSB7XG5cdFx0XHRcdFx0XHRzb3VyY2UuaW5zZXJ0QmVmb3JlKGl0ZW0sIHNvdXJjZS5jaGlsZHJlbltpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1tb3ZlZnJvbS1wb3MnKV0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzb3VyY2UuYXBwZW5kQ2hpbGQoaXRlbSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vc2hvdyBpdFxuXHRcdFx0aXRlbS5jbGFzc0xpc3QuYWRkKCd2aXNpYmxlJyk7XG5cdFx0fSk7XG5cblx0XHRwbGFjZU1lbnVCdXR0b25zKCk7IC8vcnVubmluZyB0aGUgbW92aW5nIG9mIG1lbnUgYnV0dG9ucyBoZXJlLiBub3RoaW5nIHRvIGRvIHdpdGggbW92aW5nIGl0ZW1zLlxuXG5cdFx0Ly9maXggaGVpZ2h0IG9mIGZpeGVkIGhvbGRlciBmaXhlZCBhdCB0b3AgaXRlbXNcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZml4ZWQtaG9sZGVyJykuZm9yRWFjaChmaXhlZD0+e1xuXHRcdFx0Zml4ZWQuc3R5bGUuaGVpZ2h0ID0gZml4ZWQuZmlyc3RFbGVtZW50Q2hpbGQuY2xpZW50SGVpZ2h0ICsgJ3B4Jztcblx0XHR9KTtcblxuXHR9XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRocm90dGxlKG1vdmVJdGVtcywgMjUwKSk7XG5cdG1vdmVJdGVtcygpO1xuXG5cblxuXG5cdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkb20tbG9hZGluZycpO1xuXG5cblx0Ly9hZGQgZmluaXNoZWQgbG9hZGluZyBGdW1wIGV2ZW50c1xuXHRsZXQgRXZlbnRGaW5pc2hlZCA9IG51bGw7XG5cdGlmIChpc0lFMTEpIHtcblx0XHRFdmVudEZpbmlzaGVkID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG5cblx0XHQvLyBEZWZpbmUgdGhhdCB0aGUgZXZlbnQgbmFtZSBpcyAnYnVpbGQnLlxuXHRcdEV2ZW50RmluaXNoZWQuaW5pdEV2ZW50KCdhZnRlcklnbkV2ZW50cycsIHRydWUsIHRydWUpO1xuXG5cdH0gZWxzZSB7XG5cdFx0RXZlbnRGaW5pc2hlZCA9IG5ldyBFdmVudCgnYWZ0ZXJJZ25FdmVudHMnKTtcblx0fVxuXHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KEV2ZW50RmluaXNoZWQpO1xufSk7XG5cblxuLyotLS0tLS0tIEZ1bmN0aW9uIGZvciBoaSByZWQgYmFja2dyb3VuZCBpbWFnZSBzd2FwIC0tLS0tLS0tKi9cblxuLy9jaGVjayBpZiBkZXZpY2UgaXMgcmV0aW5hXG5mdW5jdGlvbiBpc0hpZ2hEZW5zaXR5KCkge1xuXHRyZXR1cm4gKCh3aW5kb3cubWF0Y2hNZWRpYSAmJiAod2luZG93Lm1hdGNoTWVkaWEoJygtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCAobWluLXJlc29sdXRpb246IDE5MmRwaSknKS5tYXRjaGVzKSkpO1xufVxuXG4vL2NoZWNrIGlmIGZpbGUgZXhpc3RzIG9uIHNlcnZlciBiZWZvcmUgdXNpbmdcbmZ1bmN0aW9uIGZpbGVFeGlzdHMoaW1hZ2VfdXJsKSB7XG5cdGxldCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdGh0dHAub3BlbignSEVBRCcsIGltYWdlX3VybCwgdHJ1ZSk7XG5cdGh0dHAuc2VuZCgpO1xuXHRyZXR1cm4gaHR0cC5zdGF0dXMgIT0gNDA0O1xufVxuXG5cbi8vQWRkIGlubGluZSByZXRpbmEgaW1hZ2UgaWYgZm91bmQgYW5kIG9uIHJldGluYSBkZXZpY2UuIFRvIHVzZSBhZGQgZGF0YS1oaWdoLXJlcyB0byBhbiBpbmxpbmUgZWxlbWVudCB3aXRoIGEgYmFja2dyb3VuZC1pbWFnZVxuaWYgKGlzSGlnaERlbnNpdHkoKSkge1xuXG5cdGxldCByZXRpbmFJbWFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWhpZ2gtcmVzXScpO1xuXHRyZXRpbmFJbWFnZS5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdGxldCBpbWFnZTJ4ID0gJyc7XG5cdFx0Ly9pZiBhIGhpZ2ggcmVzIGlzIHByb3ZpZGVkIHVzZSB0aGF0LCBlbHNlIHVzZSBiYWNrZ3JvdW5kIGltYWdlIGJ1dCBhZGQgMnggYXQgZW5kLlxuXHRcdGlmIChpdGVtLmRhdGFzZXQuaGlnaFJlcykge1xuXHRcdFx0aW1hZ2UyeCA9IGl0ZW0uZGF0YXNldC5oaWdoUmVzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2dldCB1cmwgZm9yIG9yaWdpbmFsIGltYWdlXG5cdFx0XHRsZXQgaW1hZ2UgPSBpdGVtLnN0eWxlLmJhY2tncm91bmRJbWFnZS5zbGljZSg0LCAtMSkucmVwbGFjZSgvXCIvZywgXCJcIik7XG5cdFx0XHQvL2FkZCBAMnggdG8gaXQgaWYgaW1hZ2UgZXhpc3RzLlxuXHRcdFx0aW1hZ2UyeCA9IGltYWdlLnJlcGxhY2UoLyhcXC5bXi5dKyQpLywgJ0AyeCQxJyk7XG5cdFx0fVxuXG5cdFx0aWYgKGZpbGVFeGlzdHMoaW1hZ2UyeCkpIHtcblx0XHRcdGl0ZW0uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybChcIicgKyBpbWFnZTJ4ICsgJ1wiKSc7XG5cdFx0fVxuXG5cdH0pO1xufVxuXG5cbiIsIlxuLy90dXJuIGljb25zIGludG8gc3ZnIGlmIHVzaW5nIHRoZSBpY29ucyB0aGF0IGNvbWUgd2l0aCB0aGVtZSBmb2xkZXJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zdmctaWNvbicpLmZvckVhY2goaWNvbiA9Pntcblx0XHRpY29uLmNsYXNzTGlzdC5yZW1vdmUoJ3N2Zy1pY29uJyk7XG5cblx0XHQvL2NsYXNzbGlzdC52YWx1ZSBkb2VzIG5vdCB3b2tyIGluIGllMTEuIHVzZSBnZXRBdHRyYml1dGVcblx0XHRsZXQgaWNvbkNsYXNzID0gaWNvbi5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyk7XG5cblx0XHQvL2llMTEgZG9lcyBub3Qgd29yayB3ZWxsIHdpdGggbm9kZXMuIG5lZWRlZCB0byBhZGQgYXMgc3RyaW5nLiBubyBjcmVhdGVlbGVtZW50TlNcblx0XHRsZXQgaWNvblN0cmluZyA9IGA8c3ZnIGNsYXNzPVwiaWNvbiAke2ljb25DbGFzc31cIiByb2xlPVwiaW1nXCI+PHVzZSBocmVmPVwiIyR7aWNvbkNsYXNzfVwiIHhsaW5rOmhyZWY9XCIjJHtpY29uQ2xhc3N9XCI+PC91c2U+PC9zdmc+YDtcblxuXHRcdC8vIGxldCBpY29uc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpO1xuXHRcdC8vIGljb25zdmcuc2V0QXR0cmlidXRlKCdjbGFzcycsICdpY29uICcgKyBpY29uQ2xhc3MpO1xuXHRcdC8vIGljb25zdmcuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2ltZycpO1xuXHRcdC8vaWNvbnN2Zy5pbm5lckhUTUwgPSBgPHVzZSBocmVmPVwiIyR7aWNvbkNsYXNzfVwiIHhsaW5rOmhyZWY9XCIjJHtpY29uQ2xhc3N9XCI+PC91c2U+YDtcblxuXG5cdFx0aWNvbi5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyZW5kJywgaWNvblN0cmluZyk7XG5cdFx0aWNvbi5yZW1vdmUoKTtcblxuXHR9KTtcbn0pO1xuIiwiXHJcblxyXG5cclxuZnVuY3Rpb24gbXlGdW5jdGlvbigpIHtcclxuICB2YXIgZG90cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG90c1wiKTtcclxuICB2YXIgbW9yZVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vcmVcIik7XHJcbiAgdmFyIGJ0blRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlYWRNb3JlQnRuXCIpO1xyXG5cclxuICBpZiAoZG90cy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xyXG4gICAgZG90cy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcclxuICAgIGJ0blRleHQuaW5uZXJIVE1MID0gXCJSZWFkIG1vcmVcIjtcclxuICAgIG1vcmVUZXh0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICB9IGVsc2Uge1xyXG4gICAgZG90cy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICBidG5UZXh0LmlubmVySFRNTCA9IFwiUmVhZCBsZXNzXCI7XHJcbiAgICBtb3JlVGV4dC5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcclxuICB9XHJcbn0gIiwiLyotLS0tLS0tIG1vdmUgc3VibWVudXMgaWYgdG9vIGNsb3NlIHRvIGVkZ2Ugb24gZGVza3RvcCAtLS0tLS0tLSovXG5mdW5jdGlvbiBmaXhPZmZTY3JlZW5NZW51IChtZW51KSB7XG5cblx0Ly9tYWtlIGl0ZW0gdmlzaWJsZSBzbyB3ZSBjYW4gZ2V0IGxlZnQgZWRnZVxuXHRtZW51LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRtZW51LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG5cdGxldCByaWdodEVkZ2UgPSBtZW51LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xuXHRsZXQgbGVmdEVkZ2UgPSBtZW51LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xuXHQvL3NldCBtZW51IGJhY2tcblx0bWVudS5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cdG1lbnUuc3R5bGUub3BhY2l0eSA9ICcnO1xuXG5cdGxldCB2aWV3cG9ydCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuXHQvL2lmIHRoZSBzdWJtZW51IGlzIG9mZiB0aGUgcGFnZSwgcHVsbCBpdCBiYWNrIHNvbWV3aGF0XG5cdGlmIChyaWdodEVkZ2UgPiB2aWV3cG9ydCkge1xuXHRcdG1lbnUuc3R5bGUubGVmdCA9ICc0MHB4Jztcblx0fVxuXG5cdGlmIChsZWZ0RWRnZSA8IDApIHtcblx0XHRtZW51LnN0eWxlLmxlZnQgPSAnNjAlJztcblx0fVxufVxuXG4vKlxub3BlbiBhbmQgY2xvc2VzIGEgbWVudSBkcm9wZG93biBiYXNlZCBvbiBwYXNzaW5nIHRoZSBkcm9wZG93biBidXR0b24uIFRoZSBidXR0b25zIGNsYXNzIGRldGVybWluZXMgaWYgaXQgb3BlbnMgb3IgY2xvc2VzXG5mb3IgaXQgdG8gb3BlbiBtYWtlIHN1cmUgdGhlIGJ1dHRvbiBiZWluZyBwYXNzZWQgaGFzIGEgY2xhc3Mgb2YgdG9nZ2xlZC1vblxuICovXG5mdW5jdGlvbiBvcGVuQ2xvc2VNZW51IChtZW51QnV0dG9uKSB7XG5cblx0bGV0IG1lbnVJdGVtID0gbWVudUJ1dHRvbi5jbG9zZXN0KCdsaScpO1xuXHRsZXQgc3ViTWVudSA9IG1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5zdWItbWVudScpO1xuXHRsZXQgaXNUb2dnbGVkID0gbWVudUJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoJ3RvZ2dsZWQtb24nKSA/ICdvcGVuJyA6ICdjbG9zZSc7XG5cblx0aWYgKGlzVG9nZ2xlZCA9PT0gJ29wZW4nKSB7XG5cdFx0Zml4T2ZmU2NyZWVuTWVudShzdWJNZW51KTtcblx0XHQvL2FkZCBjbGFzcyB0b2dnbGVkLW9uIHRvIGxpLiBjYW50IGRvIGl0IHZpYSBkYXRhLXRhcmdldCBjYXVzZSBtZW51IG1pZ2h0IGJlIHNob3dpbmcgdHdpY2Ugb24gcGFnZVxuXHRcdG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWQtb24nKTtcblx0XHRpZ25TbGlkZURvd24oc3ViTWVudSk7XG5cblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG5cdFx0XHRpZiAoIWUudGFyZ2V0LmNsb3Nlc3QoJy5tZW51LWl0ZW0udG9nZ2xlZC1vbicpKSB7XG5cdFx0XHRcdC8vY2xvc2UgbWVudXNcblx0XHRcdFx0bWVudUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkLW9uJyk7XG5cdFx0XHRcdG9wZW5DbG9zZU1lbnUobWVudUJ1dHRvbik7XG5cdFx0XHR9XG5cdFx0fSwgeyBvbmNlOiB0cnVlIH0pO1xuXG5cdH0gZWxzZSB7XG5cdFx0bWVudUl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgndG9nZ2xlZC1vbicpO1xuXHRcdGlnblNsaWRlVXAoc3ViTWVudSk7XG5cdH1cblxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuXG5cdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcblx0XHRsZXQgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5tZW51IGFbaHJlZj1cIiNcIl0nKTtcblx0XHRpZihpdGVtICYmIGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nICE9IG51bGwpe1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aXRlbS5uZXh0RWxlbWVudFNpYmxpbmcuY2xpY2soKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qLS0tLS0tLSBzbGlkZSBzdWIgbWVudXMgb3BlbiBhbmQgY2xvc2VkIHdoZW4gYSBkcm9wZG93biBidXR0b24gaXMgY2xpY2tlZCAtLS0tLS0tLSovXG5cdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignYWZ0ZXJUb2dnbGUnLCBldnQgPT4ge1xuXHRcdC8vZm9yIGV2ZXJ5IGRyb3Bkb3duIG1lbnUgYnV0dG9uICg+KSwgd2hlbiBjbGlja2VkLCB0b2dnbGUgdGhlIGxpIHBhcmVudCBhbmQgb3BlbiB0aGUgc3ViLW1lbnUgd2l0aCBzbGlkZVxuXHRcdGlmIChldnQudGFyZ2V0LmNsb3Nlc3QoJy5zdWJtZW51LWRyb3Bkb3duLXRvZ2dsZScpKSB7XG5cdFx0XHRvcGVuQ2xvc2VNZW51KGV2dC50YXJnZXQuY2xvc2VzdCgnLnN1Ym1lbnUtZHJvcGRvd24tdG9nZ2xlJykpO1xuXHRcdH1cblx0fSk7XG5cblx0LyotLS0tLS0tIE9wZW4gYW55IGN1cnJlbnQgbWVudSBpdGVtcyBpbiB2ZXJ0aWNhbCBtZW51cyAtLS0tLS0tLSovXG5cdC8vaWYgYSB2ZXJ0aWNhbCBtZW51IGhhcyBhIGN1cnJlbnQgaXRlbSBpdCBpcyBzZXQgdG8gZGlzcGxheSBibG9jay4gV2UgY2FuIHRhcmdldCB0aGF0IGFuZCB1c2UgaXQgdG8gc2V0IHRoZSBjbGljayB0byBvcGVuXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZW51IC5jdXJyZW50LW1lbnUtaXRlbSAuc3ViLW1lbnUsIC5tZW51IC5jdXJyZW50LW1lbnUtcGFyZW50IC5zdWItbWVudScpLmZvckVhY2goc3ViTWVudSA9PiB7XG5cdFx0Ly9pZiBpdHMgYSB2ZXJ0aWNhbCBtZW51XG5cdFx0aWYgKGdldENvbXB1dGVkU3R5bGUoc3ViTWVudS5jbG9zZXN0KCcubWVudScpKS5mbGV4RGlyZWN0aW9uID09PSAnY29sdW1uJykge1xuXHRcdFx0c3ViTWVudS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdHN1Yk1lbnUuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0c3ViTWVudS5jbG9zZXN0KCcubWVudS1pdGVtJykuY2xhc3NMaXN0LmFkZCgndG9nZ2xlZC1vbicpO1xuXHRcdFx0c3ViTWVudS5jbG9zZXN0KCcubWVudS1pdGVtJykucXVlcnlTZWxlY3RvcignLnN1Ym1lbnUtZHJvcGRvd24tdG9nZ2xlJykuY2xhc3NMaXN0LmFkZCgndG9nZ2xlZC1vbicpO1xuXHRcdH1cblxuXHR9KTtcblxuXHQvKi0tLS0tLS0gVGFiYmluZyB0aHJvdWdoIHRoZSBtZW51IGZvciBBREEgY29tcGxpYW5jZSAtLS0tLS0tLSovXG5cblx0bGV0IGxhc3RUYWJiZWRJdGVtID0gJyc7XG5cblx0Ly9mb2N1c1xuXHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBlID0+IHtcblxuXHRcdGlmIChlLnRhcmdldC5jbG9zZXN0KCcubWVudS1pdGVtLWxpbmsgYScpKSB7XG5cdFx0XHRsZXQgbWVudUl0ZW1MaW5rID0gZS50YXJnZXQuY2xvc2VzdCgnLm1lbnUtaXRlbS1saW5rIGEnKTtcblxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0bGV0IGNvZGUgPSAoZS5rZXlDb2RlID8gZS5rZXlDb2RlIDogZS53aGljaCk7XG5cdFx0XHRcdC8vdGFiIG9yIHNoaWZ0IHRhYlxuXHRcdFx0XHRpZiAoY29kZSA9PT0gOSB8fCBjb2RlID09PSAxNikge1xuXHRcdFx0XHRcdG1lbnVJdGVtTGluay5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZvY3VzJyk7IC8vYWRkIGZvY3VzIHRvIC5tZW51LWl0ZW0tbGlua1xuXHRcdFx0XHRcdC8vaWYgdGhpcyBlbGVtZW50IGhhcyBhIGRyb3Bkb3duIG5lYXIgaXQsIHRvZ2dsZSBpdCBub3dcblx0XHRcdFx0XHRpZiAobWVudUl0ZW1MaW5rLm5leHRFbGVtZW50U2libGluZyAhPT0gbnVsbCAmJiAhbWVudUl0ZW1MaW5rLmNsb3Nlc3QoJ2xpJykuY2xhc3NMaXN0LmNvbnRhaW5zKCd0b2dnbGVkLW9uJykpIHtcblx0XHRcdFx0XHRcdG1lbnVJdGVtTGluay5uZXh0RWxlbWVudFNpYmxpbmcuY2xpY2soKTsgLy9jbGljayB0aGUgYnV0dG9uIHRvIG9wZW4gdGhlIHN1Yi1tZW51XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9pZiB0aGVyZSBpcyBhbiBpdGVtIGZvY3VzZWQgYmVmb3JlXG5cdFx0XHRcdFx0aWYgKGxhc3RUYWJiZWRJdGVtKSB7XG5cdFx0XHRcdFx0XHQvL2NoZWNrIGlmIGxhc3QgaXRlbSBoYWQgYSBzdWIgbWVudSBhbmQgd2UgYXJlIG5vdCBpbnNpZGUgaXQgbm93XG5cdFx0XHRcdFx0XHRpZiAobGFzdFRhYmJlZEl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nICE9PSBudWxsICYmICFsYXN0VGFiYmVkSXRlbS5jbG9zZXN0KCdsaScpLmNvbnRhaW5zKG1lbnVJdGVtTGluaykpIHtcblx0XHRcdFx0XHRcdFx0bGFzdFRhYmJlZEl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSwgeyBvbmNlOiB0cnVlIH0pO1xuXHRcdH1cblx0fSk7XG5cbi8vYmx1clxuXHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgZSA9PiB7XG5cblx0XHRpZiAoZS50YXJnZXQuY2xvc2VzdCgnLm1lbnUtaXRlbS1saW5rIGEnKSkge1xuXHRcdFx0bGV0IG1lbnVJdGVtTGluayA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5tZW51LWl0ZW0tbGluayBhJyk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRsZXQgY29kZSA9IChlLmtleUNvZGUgPyBlLmtleUNvZGUgOiBlLndoaWNoKTtcblx0XHRcdFx0Y29uc29sZS5sb2coY29kZSk7XG5cdFx0XHRcdGlmIChjb2RlID09PSA5IHx8IGNvZGUgPT09IDE2KSB7XG5cdFx0XHRcdFx0Ly9ibHVyIGN1cnJlbnQgdGFiYmVkIGl0ZW0sIGJ1dCBkb250IGNsb3NlIGl0IGlmIGl0cyBhIHN1Yi1tZW51XG5cdFx0XHRcdFx0bWVudUl0ZW1MaW5rLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZm9jdXMnKTtcblx0XHRcdFx0XHRsYXN0VGFiYmVkSXRlbSA9IG1lbnVJdGVtTGluaztcblx0XHRcdFx0XHRjb25zdCBzdWJNZW51ID0gbWVudUl0ZW1MaW5rLmNsb3Nlc3QoJy5zdWItbWVudScpO1xuXG5cdFx0XHRcdFx0Ly9pZiB3ZSBibHVycmVkIGFuIGl0ZW0gaW4gYSBzdWItbWVudVxuXHRcdFx0XHRcdGlmIChzdWJNZW51ICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnYmx1cnJlZCBpdGVtIGluc2lkZSBzdWItbWVudScpO1xuXHRcdFx0XHRcdFx0Y29uc3QgbWVudUl0ZW0gPSBtZW51SXRlbUxpbmsuY2xvc2VzdCgnLm1lbnUtaXRlbScpO1xuXHRcdFx0XHRcdFx0Ly9pZiBpdHMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgc3VibWVudSBhbmQgaXQgZG9lcyBub3QgaGF2ZSBhIHN1Yi1tZW51IGl0c2VsZlxuXHRcdFx0XHRcdFx0aWYgKG1lbnVJdGVtLm5leHRFbGVtZW50U2libGluZyA9PSBudWxsICYmIG1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5zdWItbWVudScpID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0bWVudUl0ZW0ucGFyZW50RWxlbWVudC5jbG9zZXN0KCcubWVudS1pdGVtJykucXVlcnlTZWxlY3RvcignLnN1Ym1lbnUtZHJvcGRvd24tdG9nZ2xlJykuY2xpY2soKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXHRcdFx0fSwgeyBvbmNlOiB0cnVlIH0pO1xuXG5cdFx0fVxuXHR9KTtcblxuXHQvL2FwcC1tZW51IGFiaWxpdHkgZm9yIHRoZSB0b3AgbWVudVxuXHRsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cdGxldCBtZW51VG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWxlZnQtdG9nZ2xlJyk7XG5cdGxldCB0b3BOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2l0ZS10b3AnKTtcblx0bGV0IHBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnZScpO1xuXG5cdC8vZmlyc3QgbW92ZSB0aGUgYnV0dG9uIGludG8gc2l0ZS10b3AgaWYgYXBwLW1lbnUgaXMgYmVpbmcgdXNlZCBjYXVzZSB3ZSBkb250IHdhbnQgaXQgb24gdGhlIG91dHNpZGVcblx0aWYgKGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdhcHAtbWVudScpKSB7XG5cdFx0dG9wTmF2LmFwcGVuZChtZW51VG9nZ2xlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNsb3NlQXBwTWVudSAoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRtZW51VG9nZ2xlLmNsaWNrKCk7XG5cdH1cblxuXHQvL3doZW4gYnV0dG9uIGlzIG9wZW5lZCB3ZSB3aWxsIGxvY2sgdGhlIGJvZHkgc28gdGhlcmUgaXMgbm8gc2Nyb2xsaW5nIGFuZCB0aGVuIG9wZW4gdGhlIHBhZ2Vcblx0aWYgKG1lbnVUb2dnbGUpIHtcblx0XHRtZW51VG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2FmdGVyVG9nZ2xlJywgZSA9PiB7XG5cdFx0XHQvL2lmIGJ1dHRvbiBoYXMgYmVlbiB0b2dnbGVkIG9uXG5cdFx0XHRpZiAobWVudVRvZ2dsZS5jbGFzc0xpc3QuY29udGFpbnMoJ3RvZ2dsZWQtb24nKSkge1xuXHRcdFx0XHRib2R5LmNsYXNzTGlzdC5hZGQoJ2JvZHktbG9jaycpO1xuXG5cdFx0XHRcdC8vY2xpY2tpbmcgYW55d2hlcmUgb3V0c2lkZSB0aGUgbWVudSB3aWxsIGNsb3NlIGl0XG5cdFx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaXRlLWNvbnRlbnQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlQXBwTWVudSwgeyBvbmNlOiB0cnVlIH0pO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaXRlLWNvbnRlbnQnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlQXBwTWVudSk7XG5cblx0XHRcdFx0aWYgKGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdhcHAtbWVudScpKSB7XG5cdFx0XHRcdFx0cGFnZS5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRUcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIG9UcmFuc2l0aW9uRW5kIG1zVHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ym9keS5jbGFzc0xpc3QucmVtb3ZlKCdib2R5LWxvY2snKTsgLy9vbmx5IHJlbW92ZSB0b2dnbGUgYW5kIGhpZGUgbWVudSBvbmNlIHBhZ2UgaG9sZGVyIGZpbmlzaGVzIGl0cyB0cmFuc2l0aW9uIHRvIGNvdmVyIGl0LlxuXHRcdFx0XHRcdH0sIHsgb25jZTogdHJ1ZSB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2JvZHktbG9jaycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fVxuXG59KTsgLy9lbmQgcmVhZHlcblxualF1ZXJ5KGZ1bmN0aW9uICgkKSB7XG5cblx0Ly9tb3ZlIGxvZ28gaW4gbWlkZGxlIG9mIG1lbnUgb24gZGVza3RvcCBpZiBsb2dvIGlzIG1pZGRsZSBwb3NpdGlvblxuXHRpZiAoJCgnLmxvZ28taW4tbWlkZGxlJykubGVuZ3RoKSB7XG5cdFx0bGV0IG5hdmlnYXRpb25MaSA9ICQoJy5zaXRlLW5hdmlnYXRpb25fX25hdi1ob2xkZXIgLm1lbnUgbGknKTtcblx0XHRsZXQgbWlkZGxlID0gTWF0aC5mbG9vcigkKG5hdmlnYXRpb25MaSkubGVuZ3RoIC8gMikgLSAxO1xuXG5cdFx0Ly9hZGQgbG9nbyB0byB0aGUgbWlkZGxlIHdoZW4gcGFnZSBsb2Fkc1xuXHRcdCQoJzxsaSBjbGFzcz1cIm1lbnUtaXRlbSBsaS1sb2dvLWhvbGRlclwiPjxkaXYgY2xhc3M9XCJtZW51LWl0ZW0tbGlua1wiPjwvZGl2PjwvbGk+JykuaW5zZXJ0QWZ0ZXIobmF2aWdhdGlvbkxpLmZpbHRlcignOmVxKCcgKyBtaWRkbGUgKyAnKScpKTtcblx0XHQkKCcuc2l0ZS1sb2dvJykuY2xvbmUoKS5hcHBlbmRUbygnLmxpLWxvZ28taG9sZGVyJyk7XG5cdH1cblxufSk7XG4iLCJqUXVlcnkoZnVuY3Rpb24oJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHRoZSBjc3Mgc2VsZWN0b3IgZm9yIHRoZSBjb250YWluZXIgdGhhdCB0aGUgaW1hZ2Ugc2hvdWxkIGJlIGF0dGFjaGVkIHRvIGFzIGEgYmFja2dyb3VuZC1pbWFnZVxuICAgIHZhciBpbWdDb250YWluZXIgPSAnLmJhY2tncm91bmQtaW1hZ2UsIC5jb3Zlci1pbWFnZSc7XG5cbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3JjKGVsZW1lbnQsIGNiKVxuICAgIHtcbiAgICAgICAgdmFyIGdldFNyYztcbiAgICAgICAgaWYgKCF3aW5kb3cuSFRNTFBpY3R1cmVFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAod2luZG93LnJlc3BpbWFnZSkge1xuICAgICAgICAgICAgICAgIHJlc3BpbWFnZSh7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzIDogW2VsZW1lbnRdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh3aW5kb3cucGljdHVyZWZpbGwpIHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlZmlsbCh7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzIDogW2VsZW1lbnRdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYihlbGVtZW50LnNyYyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTcmMgPSBmdW5jdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGdldFNyYyk7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZ2V0U3JjKTtcbiAgICAgICAgICAgIGNiKGVsZW1lbnQuY3VycmVudFNyYyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZ2V0U3JjKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGdldFNyYyk7XG4gICAgICAgIGlmIChlbGVtZW50LmNvbXBsZXRlKSB7XG4gICAgICAgICAgICBnZXRTcmMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEJnSW1hZ2UoKSB7XG4gICAgICAgICQoaW1nQ29udGFpbmVyKS5lYWNoKGZ1bmN0aW9uKClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSwgaW1nID0gJHRoaXMuZmluZCgnaW1nJykuZ2V0KDApO1xuXG4gICAgICAgICAgICBnZXRDdXJyZW50U3JjKGltZywgZnVuY3Rpb24oZWxlbWVudFNvdXJjZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkdGhpcy5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBlbGVtZW50U291cmNlICsgJyknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoJ29iamVjdEZpdCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlID09PSBmYWxzZSkge1xuXG4gICAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnbm8tb2JqZWN0Zml0Jyk7XG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICBzZXRCZ0ltYWdlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldEJnSW1hZ2UoKTtcbiAgICB9XG5cbn0pOyIsIlxuLy9tYWtlIGlmcmFtZSB2aWRlb3MgcmVzcG9uc2l2ZVxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaWZyYW1lW3NyYyo9XCJ5b3V0dWJlLmNvbVwiXSwgaWZyYW1lW2RhdGEtc3JjKj1cInlvdXR1YmUuY29tXCJdLCBpZnJhbWVbc3JjKj1cInZpbWVvLmNvbVwiXSwgaWZyYW1lW2RhdGEtc3JjKj1cInZpbWVvLmNvbVwiXScpLmZvckVhY2goaWZyYW1lID0+e1xuXHRcdGlmKCEgaWZyYW1lLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd2aWRlb3dyYXBwZXInKSl7XG5cdFx0XHR3cmFwKGlmcmFtZSkuY2xhc3NMaXN0LmFkZCgndmlkZW93cmFwcGVyJyk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiLyotLS0tLS0tIENvcmUgRnVuY3Rpb25zIC0tLS0tLS0tKi9cblxuLy93cmFwIGZ1bmN0aW9uXG5mdW5jdGlvbiB3cmFwKGVsLCB3cmFwcGVyKSB7XG5cdGlmICh3cmFwcGVyID09PSB1bmRlZmluZWQpIHtcblx0XHR3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdH1cblx0ZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWwpO1xuXHR3cmFwcGVyLmFwcGVuZENoaWxkKGVsKTtcblx0cmV0dXJuIHdyYXBwZXI7XG59XG5cbi8vZGVib3VuY2UgdG8gc2xvdyBkb3duIGFuIGV2ZW50IHRoYXQgdXNlcnMgd2luZG93IHNpemUgb3IgdGhlIGxpa2Vcbi8vZGVib3VuY2Ugd2lsbCB3YWl0IHRpbGwgdGhlIHdpbmRvdyBpcyByZXNpemVkIGFuZCB0aGVuIHJ1blxuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG5cdHZhciB0aW1lb3V0O1xuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHRcdH07XG5cdFx0dmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcblx0XHRpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0fTtcbn1cblxuLy90aHJvdHRsZSB3aWxsIHJ1biBldmVyeSBmZXcgbWlsbGlzZWNvbmRzIGFzIG9wcG9zZWQgdG8gZXZlcnkgbWlsbGlzZWNvbmRcbmZ1bmN0aW9uIHRocm90dGxlKGZuLCB0aHJlc2hob2xkLCBzY29wZSkge1xuXHR0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKTtcblx0dmFyIGxhc3QsXG5cdFx0ZGVmZXJUaW1lcjtcblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXM7XG5cblx0XHR2YXIgbm93ID0gK25ldyBEYXRlLFxuXHRcdFx0YXJncyA9IGFyZ3VtZW50cztcblx0XHRpZiAobGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNoaG9sZCkge1xuXHRcdFx0Ly8gaG9sZCBvbiB0byBpdFxuXHRcdFx0Y2xlYXJUaW1lb3V0KGRlZmVyVGltZXIpO1xuXHRcdFx0ZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRsYXN0ID0gbm93O1xuXHRcdFx0XHRmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0XHRcdH0sIHRocmVzaGhvbGQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsYXN0ID0gbm93O1xuXHRcdFx0Zm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdFx0fVxuXHR9O1xufVxuXG5cbi8vc2xpZGUgZWxlbWVudHNcbmxldCBpZ25TbGlkZVRpbWVyO1xuXG5mdW5jdGlvbiBpZ25TbGlkZVByb3BlcnR5UmVzZXQodGFyZ2V0KSB7XG5cdGNsZWFyVGltZW91dChpZ25TbGlkZVRpbWVyKTtcblx0dGFyZ2V0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCdoZWlnaHQnKTtcblx0dGFyZ2V0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCdwYWRkaW5nLXRvcCcpO1xuXHR0YXJnZXQuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3BhZGRpbmctYm90dG9tJyk7XG5cdHRhcmdldC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbWFyZ2luLXRvcCcpO1xuXHR0YXJnZXQuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ21hcmdpbi1ib3R0b20nKTtcblx0dGFyZ2V0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCdvdmVyZmxvdycpO1xuXHR0YXJnZXQuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RyYW5zaXRpb24tZHVyYXRpb24nKTtcblx0dGFyZ2V0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCd0cmFuc2l0aW9uLXByb3BlcnR5Jyk7XG5cbn1cblxuXG5mdW5jdGlvbiBpZ25TbGlkZVVwKHRhcmdldCwgZHVyYXRpb24gPSAuNSkge1xuXHQvL2FkZCB0cmFuc2l0aW9uIGFuZCByZWFkeSB0aGUgcHJvcGVydGllc1xuXHRpZ25TbGlkZVByb3BlcnR5UmVzZXQodGFyZ2V0KTtcblx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IHRhcmdldC5vZmZzZXRIZWlnaHQgKyAncHgnO1xuXG5cdHRhcmdldC5zdHlsZS50cmFuc2l0aW9uUHJvcGVydHkgPSAnaGVpZ2h0LCBtYXJnaW4sIHBhZGRpbmcnO1xuXHR0YXJnZXQuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gZHVyYXRpb24gKyAncyc7XG5cdHRhcmdldC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXHR0YXJnZXQuc3R5bGUucGFkZGluZ1RvcCA9IDA7XG5cdHRhcmdldC5zdHlsZS5wYWRkaW5nQm90dG9tID0gMDtcblx0dGFyZ2V0LnN0eWxlLm1hcmdpbkJvdHRvbSA9IDA7XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5Ub3AgPSAwO1xuXG5cblx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IDA7XG5cdH0sIDEwMCk7XG5cblx0aWduU2xpZGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdGlnblNsaWRlUHJvcGVydHlSZXNldCh0YXJnZXQpO1xuXG5cdH0sIGR1cmF0aW9uICogMTAwMCk7XG59XG5cblxuLyoqXG4gKlxuICogQHBhcmFtIHRhcmdldFxuICogQHBhcmFtIGR1cmF0aW9uXG4gKlxuICogU3R5bGUgZWxlbWVudCBhcyBpdCBzaG91bGQgc2hvdyB0aGVuIHNldCBpdCB0byBkaXNwbGF5IG5vbmUgKG9yIGhhdmUgaXQgZ2V0IGRpc3BsYXkgbm9uZSBmcm9tIHNsaWRlIHVwIG9yIHNvbWV0aGluZyBlbHNlKVxuICovXG5mdW5jdGlvbiBpZ25TbGlkZURvd24odGFyZ2V0LCBkdXJhdGlvbiA9IC41KSB7XG5cdC8vcmVtb3ZlIGFueSBpbmxpbmUgcHJvcGVydGllcyBmb3IgZGlzcGxheSBhbmQgcGFkZGluZyBhbmQgbWFyZ2lucyB0aGF0IG1pZ2h0IGJlIHRoZXJlLCBtYXkgaGF2ZSBwcmVzc2VkIHRoaXMgd2hpbGUgaXQgd2FzIHNsaWRpbmcgZG93blxuXHRpZ25TbGlkZVByb3BlcnR5UmVzZXQodGFyZ2V0KTtcblxuXG5cdC8vc2F2ZSBvcmlnaW5hbCBtYXJnaW5zLCBjaGVjayB3aGV0aGVyIHdlIGFyZSBzZXR0aW5nIHRvIGJsb2NrIG9yIHNvbWUgb3RoZXIgKGZsZXgsIGlubGluZS1ibG9jaykuLi5cblx0bGV0IGRpc3BsYXkgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmRpc3BsYXk7XG5cdGNvbnN0IHBhZGRpbmcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLnBhZGRpbmc7XG5cdGNvbnN0IG1hcmdpbiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCkubWFyZ2luO1xuXG5cblx0Ly9pZiBpdHMgbm9uZSBtYWtlIGl0IGEgYmxvY2sgZWxlbWVudCB0aGVuIGdyYWIgaXRzIGhlaWdodCBxdWlja2x5XG5cdGlmIChkaXNwbGF5ID09PSAnbm9uZScpIHtcblx0XHRkaXNwbGF5ID0gJ2Jsb2NrJztcblx0fVxuXG5cdHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTsgLy9taWdodCBiZSBpbmxpbmUtYmxvY2suLi5cblxuXHQvL3Nob3cgZWxlbWVudCBmb3IgcyBtaWxpc2Vjb25kIGFuZCBncmFiIGhlaWdodFxuXHR0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHR0YXJnZXQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblx0bGV0IGhlaWdodCA9IHRhcmdldC5vZmZzZXRIZWlnaHQ7IC8vZ3JhYiBoZWlnaHQgd2hpbGUgYXV0b1xuXG5cdC8vc2V0IGFueSBvdGhlciBwcm9ibGVtYXRpYyBwcm9wZXJ0eSB0byAwXG5cdHRhcmdldC5zdHlsZS50cmFuc2l0aW9uUHJvcGVydHkgPSAnbm9uZSc7XG5cdHRhcmdldC5zdHlsZS5oZWlnaHQgPSAnMHB4JzsgLy9zZXQgaGVpZ2h0IGJhY2sgdG8gMFxuXHR0YXJnZXQuc3R5bGUucGFkZGluZ1RvcCA9ICcwcHgnO1xuXHR0YXJnZXQuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcwcHgnO1xuXHR0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0gJzBweCc7XG5cdHRhcmdldC5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMHB4JztcblxuXHQvL3NldCBkaXNwbGF5IHRvIHNob3csIGJ1dCBwYWRkaW5nIGFuZCBoZWlnaHQgdG8gMCByaWdodCBhd2F5XG5cdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdC8vdHVybiBvbiAgdHJhbnNpdGlvbnMgYWRuIGFuaW1hdGUgcHJvcGVydGllcyBiYWNrIHRvIG5vcm1hbFxuXHRcdHRhcmdldC5zdHlsZS50cmFuc2l0aW9uUHJvcGVydHkgPSBcImhlaWdodCwgbWFyZ2luLCBwYWRkaW5nXCI7XG5cdFx0dGFyZ2V0LnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uICsgJ3MnO1xuXHRcdHRhcmdldC5zdHlsZS5wYWRkaW5nID0gcGFkZGluZztcblx0XHR0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4Jztcblx0XHR0YXJnZXQuc3R5bGUubWFyZ2luID0gbWFyZ2luO1xuXG5cdH0sIDEwMCk7XG5cblx0Ly9hZnRlciBpdCBzbGlkZXMgb3BlbiByZW1vdmUgcHJvcGVydGllc1xuXHRpZ25TbGlkZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0aWduU2xpZGVQcm9wZXJ0eVJlc2V0KHRhcmdldCk7XG5cdH0sIGR1cmF0aW9uICogMTAwMCk7XG59XG5cbmZ1bmN0aW9uIGlnblNsaWRlVG9nZ2xlKHRhcmdldCwgZHVyYXRpb24gPSAuNSkge1xuXHRpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5kaXNwbGF5ID09PSAnbm9uZScpIHtcblx0XHRyZXR1cm4gaWduU2xpZGVEb3duKHRhcmdldCwgZHVyYXRpb24pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBpZ25TbGlkZVVwKHRhcmdldCwgZHVyYXRpb24pO1xuXHR9XG59XG5cbiIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG5cblxuXHQvL21vdmUgdGhlIGhlYWRlciBhYm92ZSB0aGUgYXJ0aWNsZSB3aGVuIGhlYWRlci1hYm92ZSBpcyBmb3VuZFxuXHRjb25zdCBoZWFkZXJBYm92ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItYWJvdmUnKTtcblx0aWYgKGhlYWRlckFib3ZlIT09bnVsbCkge1xuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lbnRyeS1oZWFkZXIsIC5wYWdlLWhlYWRlcicpLmZvckVhY2goaGVhZGVyID0+IHtcblx0XHRcdGhlYWRlckFib3ZlLnBhcmVudEVsZW1lbnQucHJlcGVuZChoZWFkZXIpO1xuXHRcdFx0aGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2hlYWRlci1tb3ZlZCcpOyAvL21pZ2h0IGJlIHVzZWZ1bCBmb3Igc29tZW9uZVxuXHRcdH0pO1xuXHR9XG5cblx0Ly93aGVuIGEgc2Vjb25kYXJ5IGlzIHVzZWQsIGEgc2lkZWJhciBpcyBzaG93biwgb24gbG9hZCB3ZSBkbyBhIGZldyB0aGluZ3MgdG8gc21vb3RoIHRoZSB0cmFuc2l0aW9uIG9mIHRoZSBoZWFkZXJcblx0bGV0IHNpZGViYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2Vjb25kYXJ5Jyk7XG5cdGlmIChzaWRlYmFyIT09bnVsbCkge1xuXHRcdHNpZGViYXIuaW5uZXJIVE1MID0gc2lkZWJhci5pbm5lckhUTUwudHJpbSgpOyAvL2lmIG1vdmluZyBzdHVmZiBpbiBhbmQgb3V0IGl0cyBnb29kIHRvIHJlbW92ZSBleHRyYSBzcGFjZSBzbyA6ZW1wdHkgd29ya3Ncblx0XHRsZXQgc2lkZWJhclRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXItdGVtcGxhdGUnKTtcblx0XHRzaWRlYmFyVGVtcGxhdGUuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdH1cblxufSk7XG5cblxuXG5cbiIsImxldCBzY3JvbGxFdmVudCA9IG5ldyBFdmVudCgnYWZ0ZXJTY3JvbGwnLCB7IGJ1YmJsZXM6IHRydWUgfSk7IC8vYnViYmxlIGFsbG93cyBmb3IgZGVsZWdhdGlvbiBvbiBib2R5XG5cbi8qKlxuICogcnVucyB3aGVuIGFuIGFuY2hvciBpcyBjbGlja2VkIG9yIHRoZSBwYWdlIGxvYWRzIHdpdGggYW4gYW5jaG9yXG4gKiB0aGUgaXRlbSB3ZSBhcmUgc2Nyb2xsaW5nIHRvIGNhbiBoYXZlIGFuIG9mZnNldFxuICogQHBhcmFtIGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gc2Nyb2xsdG9IYXNoIChlbGVtZW50KSB7XG5cblx0bGV0IG9mZnNldCA9IGVsZW1lbnQuZGF0YXNldC5vZmZzZXQgfHwgJ3N0YXJ0JztcblxuXHQvL2lmIHRoZSBvZmZzZXQgaXMgYSBzdHJpbmcgJ3N0YXJ0LCBjZW50ZXIsIG9yIGVuZCdcblx0aWYgKGlzTmFOKHBhcnNlSW50KG9mZnNldCkpKSB7XG5cdFx0ZWxlbWVudC5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiAnc21vb3RoJywgYmxvY2s6IG9mZnNldCB9KTtcblx0fSBlbHNlIHtcblx0XHQvL2Zyb20gdG9wIHNjcm9sbCB3aXRoIG9mZnNldFxuXHRcdGxldCBmcm9tVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0ICsgZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyBwYXJzZUludChvZmZzZXQpO1xuXG5cdFx0d2luZG93LnNjcm9sbCh7IGJlaGF2aW9yOiAnc21vb3RoJywgdG9wOiBmcm9tVG9wIH0pO1xuXHR9XG5cblx0Ly9maXJlIHNvbWUgbW9yZSBldmVudHNcblx0ZWxlbWVudC5kaXNwYXRjaEV2ZW50KHNjcm9sbEV2ZW50KTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcblxuXHRpZiAobG9jYXRpb24uaGFzaCkge1xuXHRcdHNjcm9sbHRvSGFzaChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGxvY2F0aW9uLmhhc2gpKTtcblx0fVxuXG5cdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcblx0XHRsZXQgaXRlbSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2FbaHJlZl49XCIjXCJdJyk7XG5cblx0XHRpZiAoaXRlbSkge1xuXHRcdFx0bGV0IGl0ZW1IYXNoID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuXHRcdFx0aWYgKGl0ZW1IYXNoICE9PSAnIycgJiYgaXRlbUhhc2ggIT09ICcjMCcpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzY3JvbGx0b0hhc2goZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpdGVtSGFzaCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdhZnRlclNjcm9sbCcsIGZ1bmN0aW9uIChlKSB7XG5cdC8vcnVuIGFuIGV2ZW50IGFmdGVyIHNjcm9sbCBiZWdpbnNcbn0pO1xuXG5cblxuIiwibGV0IHNjcm9sbE1hZ2ljQ29udHJvbGxlciA9ICcnO1xuXG4vL3NldHVwIHNjcm9sbGVyIGZ1bmN0aW9uXG4vKipcbiAqIGVsZW1lbnQgY2FuIGhhdmUgdGhlc2UgZGF0YSBhdHRyaWJ1dGVzOlxuICogZGF0YS1zY3JvbGxhbmltYXRpb24gPSBhIGNsYXNzIHRvIGFkZCB0byB0aGlzIGVsZW1lbnQgb24gc2Nyb2xsXG4gKiBkYXRhLXNjcm9sbHRyaWdnZXIgPSB0aGUgZWxlbWVudCB0aGF0IHRyaWdnZXJzIHRoZSBzY2VuZSB0byBzdGFydFxuICogZGF0YS1zY3JvbGxob29rID0gb25FbnRlciwgb25MZWF2ZSwgZGVmYXVsdCBpcyBjZW50ZXJcbiAqIGRhdGEtc2Nyb2xsb2Zmc2V0ID0gb2Zmc2V0IGZyb20gc2Nyb2xsaG9vayBvbiB0cmlnZ2VyIGVsZW1lbnRcbiAqIGRhdGEtc2Nyb2xsZHVyYXRpb24gPSBob3cgbG9uZyBpdCBzaG91bGQgbGFzdC4gaWYgbm90IHNldCwgMCAgaXMgdXNlZCBhbmQgdGhhdCBtZWFucyBpdCBkb2VzbnQgcmVzZXQgdW50aWwgeW91IHNjcm9sbCB1cC5cbiAqIGRhdGEtc2Nyb2xsc2NydWIgPSB0d2VlbnMgYmV0d2VlbiB0d28gY2xhc3NlcyBhcyB5b3Ugc2Nyb2xsLiB0d2VlbiBleHBlY3RzIGEgZHVyYXRpb24sIGVsc2UgZHVyYXRpb24gd2lsbCBiZSAxMDBcbiAqXG4gKi9cbmZ1bmN0aW9uIHJ1blNjcm9sbGVyQXR0cmlidXRlcyhlbGVtZW50KSB7XG5cdC8vdGhpcyBmdW5jdGlvbiBjYW4gYmUgcnVuIG9uIGFuIGFsZW1lbnQgZXZlbiBhZnRlciBsb2FkIGFuZCB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gc2Nyb2xsTWFnaWNDb250cm9sbGVyXG5cdC8vc2Nyb2xsbWFnaWMgbXVzdCBiZSBsb2FkZWRcblx0aWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBTY3JvbGxNYWdpYyAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zY3JvbGxhbmltYXRpb24nKSkge1xuXG5cdFx0Ly9zY3JvbGwgYW5pbWF0aW9uIGF0dHJpYnV0ZXNcblx0XHRsZXQgYW5pbWF0aW9uQ2xhc3MgPSBlbGVtZW50LmRhdGFzZXQuc2Nyb2xsYW5pbWF0aW9uLFxuXHRcdFx0dHJpZ2dlckhvb2sgPSBlbGVtZW50LmRhdGFzZXQuc2Nyb2xsaG9vayB8fCAnY2VudGVyJyxcblx0XHRcdG9mZnNldCA9IGVsZW1lbnQuZGF0YXNldC5vZmZzZXQgfHwgMCxcblx0XHRcdHRyaWdnZXJFbGVtZW50ID0gZWxlbWVudC5kYXRhc2V0LnNjcm9sbHRyaWdnZXIgfHwgZWxlbWVudCxcblx0XHRcdGR1cmF0aW9uID0gZWxlbWVudC5kYXRhc2V0LmR1cmF0aW9uIHx8IDAsXG5cdFx0XHR0d2VlbiA9IGVsZW1lbnQuZGF0YXNldC5zY3JvbGxzY3J1Yixcblx0XHRcdHJldmVyc2UgPSBlbGVtZW50LmRhdGFzZXQucmV2ZXJzZSB8fCB0cnVlO1xuXHRcdFx0c2NlbmUgPSAnJztcblxuXHRcdC8vaWYgYW5pbWF0aW9uIGhhcyB3b3JkIHVwIG9yIGRvd24sIGl0cyBwcm9iYWJseSBhbiBhbmltYXRpb24gdGhhdCBtb3ZlcyBpdCB1cCBvciBkb3duLFxuXHRcdC8vc28gbWFrZSBzdXJlIHRyaWdnZXIgZWxlbWVudFxuXHRcdGlmICgtMSAhPT0gYW5pbWF0aW9uQ2xhc3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCd1cCcpIHx8IC0xICE9PSBhbmltYXRpb25DbGFzcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2Rvd24nKSkge1xuXHRcdFx0Ly9nZXQgcGFyZW50IGVsZW1lbnQgYW5kIG1ha2UgdGhhdCB0aGUgdHJpZ2dlciwgYnV0IHVzZSBhbiBvZmZzZXQgZnJvbSBjdXJyZW50IGVsZW1lbnRcblx0XHRcdGlmICh0cmlnZ2VyRWxlbWVudCA9PT0gZWxlbWVudCkge1xuXHRcdFx0XHR0cmlnZ2VyRWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcblx0XHRcdFx0b2Zmc2V0ID0gKGVsZW1lbnQub2Zmc2V0VG9wIC0gdHJpZ2dlckVsZW1lbnQub2Zmc2V0VG9wKSArIHBhcnNlSW50KG9mZnNldCk7XG5cdFx0XHR9XG5cdFx0XHR0cmlnZ2VySG9vayA9ICdvbkVudGVyJztcblxuXHRcdH1cblxuXHRcdC8vaWYgZml4ZWQgYXQgdG9wLCB3cmFwIGluIGRpdlxuXHRcdGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxhbmltYXRpb24nKSA9PT0gJ2ZpeGVkLWF0LXRvcCcpIHtcblx0XHRcdGxldCB3cmFwcGVkRWxlbWVudCA9IHdyYXAoZWxlbWVudCwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuXHRcdFx0d3JhcHBlZEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZml4ZWQtaG9sZGVyJyk7XG5cdFx0XHR0cmlnZ2VySG9vayA9ICdvbkxlYXZlJztcblx0XHRcdHRyaWdnZXJFbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuXHRcdH1cblxuXHRcdC8vaWYgc2Nyb2xsc2NydWIgZXhpc3RzIHVzZWQgdHdlZW5tYXhcblx0XHRpZiAodHdlZW4gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKCFkdXJhdGlvbikge1xuXHRcdFx0XHRkdXJhdGlvbiA9IDEwMDtcblx0XHRcdH1cblxuXHRcdFx0dHdlZW4gPSBUd2Vlbk1heC50byhlbGVtZW50LCAuNjUsIHtcblx0XHRcdFx0Y2xhc3NOYW1lOiAnKz0nICsgYW5pbWF0aW9uQ2xhc3Ncblx0XHRcdH0pO1xuXG5cdFx0XHQvL2ZpbmFsbHkgb3V0cHV0IHRoZSBzY2VuZVxuXHRcdFx0c2NlbmUgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuXHRcdFx0XHR0cmlnZ2VyRWxlbWVudDogdHJpZ2dlckVsZW1lbnQsXG5cdFx0XHRcdG9mZnNldDogb2Zmc2V0LFxuXHRcdFx0XHR0cmlnZ2VySG9vazogdHJpZ2dlckhvb2ssXG5cdFx0XHRcdGR1cmF0aW9uOiBkdXJhdGlvbixcblx0XHRcdFx0cmV2ZXJzZTogcmV2ZXJzZVxuXG5cdFx0XHR9KS5zZXRUd2Vlbih0d2VlbikuYWRkVG8oc2Nyb2xsTWFnaWNDb250cm9sbGVyKVxuXHRcdFx0Ly8gLmFkZEluZGljYXRvcnMoKVxuXHRcdFx0O1xuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHNjZW5lID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcblx0XHRcdFx0dHJpZ2dlckVsZW1lbnQ6IHRyaWdnZXJFbGVtZW50LFxuXHRcdFx0XHRvZmZzZXQ6IG9mZnNldCxcblx0XHRcdFx0dHJpZ2dlckhvb2s6IHRyaWdnZXJIb29rLFxuXHRcdFx0XHRkdXJhdGlvbjogZHVyYXRpb24sXG5cdFx0XHRcdHJldmVyc2U6IHJldmVyc2VcblxuXHRcdFx0fSkub24oJ2VudGVyIGxlYXZlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvL2luc3RlYWQgb2YgdXNpbmcgdG9nZ2xlIGNsYXNzIHdlIGNhbiB1c2UgdGhlc2UgZXZlbnRzIG9mIG9uIGVudGVyIGFuZCBsZWF2ZSBhbmQgdG9nZ2xlIGNsYXNzIGF0IGJvdGggdGltZXNcblx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGFuaW1hdGlvbkNsYXNzKTtcblx0XHRcdFx0ZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcblxuXHRcdFx0XHQvL2lmIGZpeGVkIGF0IHRvcCBzZXQgaGVpZ2h0IGZvciBzcGFjZXIgYW5kIHdpZHRoXG5cdFx0XHRcdGlmKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbGFuaW1hdGlvbicpID09PSAnZml4ZWQtYXQtdG9wJyl7XG5cdFx0XHRcdFx0Ly9tYWtpbmcgZml4ZWQgaXRlbSBoYXZlIGEgc2V0IHdpZHRoIG1hdGNoaW5nIHBhcmVudFxuXHRcdFx0XHRcdGVsZW1lbnQuc3R5bGUud2lkdGggPSBlbGVtZW50LnBhcmVudEVsZW1lbnQuY2xpZW50V2lkdGggKyAncHgnO1xuXHRcdFx0XHRcdGVsZW1lbnQuc3R5bGUubGVmdCA9IGVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgJ3B4JztcblxuXHRcdFx0XHR9XG5cdFx0XHR9KS5hZGRUbyhzY3JvbGxNYWdpY0NvbnRyb2xsZXIpXG5cdFx0XHQvLy5zZXRDbGFzc1RvZ2dsZShlbGVtZW50LCBhbmltYXRpb25DbGFzcyArICcgYWN0aXZlJykuYWRkVG8oc2Nyb2xsTWFnaWNDb250cm9sbGVyKVxuXHRcdFx0Ly8gLmFkZEluZGljYXRvcnMoKVxuXHRcdFx0O1xuXHRcdH1cblxuXHRcdC8vZ29vZCBmb3Iga25vd2luZyB3aGVuIGl0cyBiZWVuIGxvYWRlZFxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsbWFnaWMtbG9hZGVkJyk7XG5cblx0fVxufVxuXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG5cdC8qLS0tLS0tLSBTY3JvbGwgTWFnaWMgRXZlbnRzIEluaXQgLS0tLS0tLS0qL1xuXHRpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFNjcm9sbE1hZ2ljKSB7XG5cdFx0c2Nyb2xsTWFnaWNDb250cm9sbGVyID0gbmV3IFNjcm9sbE1hZ2ljLkNvbnRyb2xsZXIoKTtcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zY3JvbGxhbmltYXRpb25dJykuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0cnVuU2Nyb2xsZXJBdHRyaWJ1dGVzKGVsZW1lbnQpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiJdfQ==