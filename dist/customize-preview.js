"use strict";

/**
 * File customize-preview.js.
 *
 * Instantly live-update customizer settings in the preview for improved user experience.
 */
//not using in end but leaving here for now
function swapImgToSvg(selector) {
  var $img = $(selector),
      imgURL = $img.attr('src'),
      imgID = $img.attr('id');
  $.get(imgURL, function (data) {
    // Get the SVG tag, ignore the rest
    var $svg = $(data).find('svg'); // Add replaced image's ID to the new SVG

    if (typeof imgID !== 'undefined') {
      $svg = $svg.attr('id', imgID);
    }

    $svg = $svg.removeAttr('xmlns:a');
    $img.replaceWith($svg);
  }, 'xml');
}

;
swapImgToSvg('.custom-logo-link img');

(function ($) {
  //check if custom logo is there and hide site title if it is
  if ($('.custom-logo-link').is(':visible')) {
    $('.site-name').hide();
  }

  wp.customize('custom_logo', function (value) {
    value.bind(function (to) {
      if (to != '') {
        $('.site-name').hide();
      } else {
        $('.site-name').show();
      }
    });
  }); // Site title and description.

  wp.customize('blogname', function (value) {
    // If logo isn't set then bind site-title for live update.
    if (!parent.wp.customize('custom_logo')()) {
      value.bind(function (to) {
        $('.site-title a').text(to);
      });
    }
  });
  wp.customize('blogdescription', function (value) {
    value.bind(function (to) {
      $('.site-description').text(to);
    });
  });
  wp.customize('site_top_contained', function (value) {
    value.bind(function (to) {
      $('.site-top-container').removeClass('container');
      $('.site-top-container').removeClass('container-fluid');
      $('.site-top-container').addClass(to);
    });
  }); // Switch logo side by adding class to site-top

  wp.customize('site_top_layout', function (value) {
    //console.log( value );
    value.bind(function (to) {
      $('.site-top').removeClass('no-logo logo-left logo-right logo-center logo-in-middle logo-center-under');
      $('.site-top').addClass(to); //if logo was min middle move it out on logo position change or move it in if it becomes middle

      if (to == 'logo-in-middle') {
        var navigationLi = $('.site-navigation__nav-holder .menu li');
        var middle = Math.floor($(navigationLi).length / 2) - 1;
        $('<li class="menu-item li-logo-holder"><div class="menu-item-link"></div></li>').insertAfter(navigationLi.filter(':eq(' + middle + ')'));
        $('.site-logo').clone().appendTo('.li-logo-holder');
      } //if its not in the middle but it was. move it out


      if (to != 'logo-in-middle' && $('.li-logo-holder').length) {
        $('.li-logo-holder').remove();
      }
    });
  }); //todo remove?
  // Whether a header image is available.

  function hasHeaderImage() {
    var image = wp.customize('header_image')();
    return '' !== image && 'remove-header' !== image;
  } // Whether a header video is available.


  function hasHeaderVideo() {
    var externalVideo = wp.customize('external_header_video')(),
        video = wp.customize('header_video')();
    return '' !== externalVideo || 0 !== video && '' !== video;
  } // Toggle a body class if a custom header exists.


  $.each(['external_header_video', 'header_image', 'header_video'], function (index, settingId) {
    wp.customize(settingId, function (setting) {
      setting.bind(function () {
        if (hasHeaderImage()) {
          $(document.body).addClass('has-header-image');
        } else {
          $(document.body).removeClass('has-header-image');
        }

        if (!hasHeaderVideo()) {
          $(document.body).removeClass('has-header-video');
        }
      });
    });
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1c3RvbWl6ZS1wcmV2aWV3LmpzIl0sIm5hbWVzIjpbInN3YXBJbWdUb1N2ZyIsInNlbGVjdG9yIiwiJGltZyIsIiQiLCJpbWdVUkwiLCJhdHRyIiwiaW1nSUQiLCJnZXQiLCJkYXRhIiwiJHN2ZyIsImZpbmQiLCJyZW1vdmVBdHRyIiwicmVwbGFjZVdpdGgiLCJpcyIsImhpZGUiLCJ3cCIsImN1c3RvbWl6ZSIsInZhbHVlIiwiYmluZCIsInRvIiwic2hvdyIsInBhcmVudCIsInRleHQiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwibmF2aWdhdGlvbkxpIiwibWlkZGxlIiwiTWF0aCIsImZsb29yIiwibGVuZ3RoIiwiaW5zZXJ0QWZ0ZXIiLCJmaWx0ZXIiLCJjbG9uZSIsImFwcGVuZFRvIiwicmVtb3ZlIiwiaGFzSGVhZGVySW1hZ2UiLCJpbWFnZSIsImhhc0hlYWRlclZpZGVvIiwiZXh0ZXJuYWxWaWRlbyIsInZpZGVvIiwiZWFjaCIsImluZGV4Iiwic2V0dGluZ0lkIiwic2V0dGluZyIsImRvY3VtZW50IiwiYm9keSIsImpRdWVyeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7QUFNQTtBQUNBLFNBQVNBLFlBQVQsQ0FBc0JDLFFBQXRCLEVBQWdDO0FBQzVCLE1BQUlDLElBQUksR0FBR0MsQ0FBQyxDQUFDRixRQUFELENBQVo7QUFBQSxNQUNJRyxNQUFNLEdBQUdGLElBQUksQ0FBQ0csSUFBTCxDQUFVLEtBQVYsQ0FEYjtBQUFBLE1BRUlDLEtBQUssR0FBR0osSUFBSSxDQUFDRyxJQUFMLENBQVUsSUFBVixDQUZaO0FBSUFGLEVBQUFBLENBQUMsQ0FBQ0ksR0FBRixDQUFNSCxNQUFOLEVBQWMsVUFBVUksSUFBVixFQUFnQjtBQUMxQjtBQUNBLFFBQUlDLElBQUksR0FBR04sQ0FBQyxDQUFDSyxJQUFELENBQUQsQ0FBUUUsSUFBUixDQUFhLEtBQWIsQ0FBWCxDQUYwQixDQUcxQjs7QUFDQSxRQUFJLE9BQU9KLEtBQVAsS0FBaUIsV0FBckIsRUFBa0M7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QWlCQyxTQUFqQixFQUE0QjtBQUMxRjNCLElBQUFBLEVBQUUsQ0FBQ0MsU0FBSCxDQUFhMEIsU0FBYixFQUF3QixVQUFVQyxPQUFWLEVBQW1CO0FBQ3ZDQSxNQUFBQSxPQUFPLENBQUN6QixJQUFSLENBQWEsWUFBWTtBQUNyQixZQUFJaUIsY0FBYyxFQUFsQixFQUFzQjtBQUNsQmhDLFVBQUFBLENBQUMsQ0FBQ3lDLFFBQVEsQ0FBQ0MsSUFBVixDQUFELENBQWlCckIsUUFBakIsQ0FBMEIsa0JBQTFCO0FBQ0gsU0FGRCxNQUVPO0FBQ0hyQixVQUFBQSxDQUFDLENBQUN5QyxRQUFRLENBQUNDLElBQVYsQ0FBRCxDQUFpQnRCLFdBQWpCLENBQTZCLGtCQUE3QjtBQUNIOztBQUVELFlBQUksQ0FBQ2MsY0FBYyxFQUFuQixFQUF1QjtBQUNuQmxDLFVBQUFBLENBQUMsQ0FBQ3lDLFFBQVEsQ0FBQ0MsSUFBVixDQUFELENBQWlCdEIsV0FBakIsQ0FBNkIsa0JBQTdCO0FBQ0g7QUFDSixPQVZEO0FBV0gsS0FaRDtBQWFILEdBZEQ7QUFnQkgsQ0E1R0QsRUE0R0d1QixNQTVHSCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRmlsZSBjdXN0b21pemUtcHJldmlldy5qcy5cbiAqXG4gKiBJbnN0YW50bHkgbGl2ZS11cGRhdGUgY3VzdG9taXplciBzZXR0aW5ncyBpbiB0aGUgcHJldmlldyBmb3IgaW1wcm92ZWQgdXNlciBleHBlcmllbmNlLlxuICovXG5cbi8vbm90IHVzaW5nIGluIGVuZCBidXQgbGVhdmluZyBoZXJlIGZvciBub3dcbmZ1bmN0aW9uIHN3YXBJbWdUb1N2ZyhzZWxlY3Rvcikge1xuICAgIHZhciAkaW1nID0gJChzZWxlY3RvciksXG4gICAgICAgIGltZ1VSTCA9ICRpbWcuYXR0cignc3JjJyksXG4gICAgICAgIGltZ0lEID0gJGltZy5hdHRyKCdpZCcpO1xuXG4gICAgJC5nZXQoaW1nVVJMLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAvLyBHZXQgdGhlIFNWRyB0YWcsIGlnbm9yZSB0aGUgcmVzdFxuICAgICAgICB2YXIgJHN2ZyA9ICQoZGF0YSkuZmluZCgnc3ZnJyk7XG4gICAgICAgIC8vIEFkZCByZXBsYWNlZCBpbWFnZSdzIElEIHRvIHRoZSBuZXcgU1ZHXG4gICAgICAgIGlmICh0eXBlb2YgaW1nSUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAkc3ZnID0gJHN2Zy5hdHRyKCdpZCcsIGltZ0lEKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzdmcgPSAkc3ZnLnJlbW92ZUF0dHIoJ3htbG5zOmEnKTtcbiAgICAgICAgJGltZy5yZXBsYWNlV2l0aCgkc3ZnKTtcbiAgICB9LCAneG1sJyk7XG5cbn07XG5zd2FwSW1nVG9TdmcoJy5jdXN0b20tbG9nby1saW5rIGltZycpO1xuXG5cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgLy9jaGVjayBpZiBjdXN0b20gbG9nbyBpcyB0aGVyZSBhbmQgaGlkZSBzaXRlIHRpdGxlIGlmIGl0IGlzXG4gICAgaWYgKCQoJy5jdXN0b20tbG9nby1saW5rJykuaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgJCgnLnNpdGUtbmFtZScpLmhpZGUoKTtcbiAgICB9XG5cblxuICAgIHdwLmN1c3RvbWl6ZSgnY3VzdG9tX2xvZ28nLCBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgICB2YWx1ZS5iaW5kKGZ1bmN0aW9uICh0bykge1xuICAgICAgICAgICAgaWYgKHRvICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNpdGUtbmFtZScpLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLW5hbWUnKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cblxuICAgIC8vIFNpdGUgdGl0bGUgYW5kIGRlc2NyaXB0aW9uLlxuICAgIHdwLmN1c3RvbWl6ZSggJ2Jsb2duYW1lJywgZnVuY3Rpb24oIHZhbHVlICkge1xuXG4gICAgICAgIC8vIElmIGxvZ28gaXNuJ3Qgc2V0IHRoZW4gYmluZCBzaXRlLXRpdGxlIGZvciBsaXZlIHVwZGF0ZS5cbiAgICAgICAgaWYgKCAhIHBhcmVudC53cC5jdXN0b21pemUoICdjdXN0b21fbG9nbycgKSgpICkge1xuICAgICAgICAgICAgdmFsdWUuYmluZCggZnVuY3Rpb24oIHRvICkge1xuICAgICAgICAgICAgICAgICQoICcuc2l0ZS10aXRsZSBhJyApLnRleHQoIHRvICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB3cC5jdXN0b21pemUoJ2Jsb2dkZXNjcmlwdGlvbicsIGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICAgIHZhbHVlLmJpbmQoZnVuY3Rpb24gKHRvKSB7XG4gICAgICAgICAgICAkKCcuc2l0ZS1kZXNjcmlwdGlvbicpLnRleHQodG8pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgd3AuY3VzdG9taXplKCdzaXRlX3RvcF9jb250YWluZWQnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFsdWUuYmluZChmdW5jdGlvbiAodG8pIHtcbiAgICAgICAgICAgICQoJy5zaXRlLXRvcC1jb250YWluZXInKS5yZW1vdmVDbGFzcygnY29udGFpbmVyJyk7XG4gICAgICAgICAgICAkKCcuc2l0ZS10b3AtY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2NvbnRhaW5lci1mbHVpZCcpO1xuICAgICAgICAgICAgJCgnLnNpdGUtdG9wLWNvbnRhaW5lcicpLmFkZENsYXNzKHRvKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cblxuICAgIC8vIFN3aXRjaCBsb2dvIHNpZGUgYnkgYWRkaW5nIGNsYXNzIHRvIHNpdGUtdG9wXG4gICAgd3AuY3VzdG9taXplKCdzaXRlX3RvcF9sYXlvdXQnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyggdmFsdWUgKTtcbiAgICAgICAgdmFsdWUuYmluZChmdW5jdGlvbiAodG8pIHtcblxuICAgICAgICAgICAgJCgnLnNpdGUtdG9wJykucmVtb3ZlQ2xhc3MoJ25vLWxvZ28gbG9nby1sZWZ0IGxvZ28tcmlnaHQgbG9nby1jZW50ZXIgbG9nby1pbi1taWRkbGUgbG9nby1jZW50ZXItdW5kZXInKTtcbiAgICAgICAgICAgICQoJy5zaXRlLXRvcCcpLmFkZENsYXNzKHRvKTtcblxuICAgICAgICAgICAgLy9pZiBsb2dvIHdhcyBtaW4gbWlkZGxlIG1vdmUgaXQgb3V0IG9uIGxvZ28gcG9zaXRpb24gY2hhbmdlIG9yIG1vdmUgaXQgaW4gaWYgaXQgYmVjb21lcyBtaWRkbGVcbiAgICAgICAgICAgIGlmICh0byA9PSAnbG9nby1pbi1taWRkbGUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5hdmlnYXRpb25MaSA9ICQoJy5zaXRlLW5hdmlnYXRpb25fX25hdi1ob2xkZXIgLm1lbnUgbGknKTtcbiAgICAgICAgICAgICAgICBsZXQgbWlkZGxlID0gTWF0aC5mbG9vcigkKG5hdmlnYXRpb25MaSkubGVuZ3RoIC8gMikgLSAxO1xuXG4gICAgICAgICAgICAgICAgJCgnPGxpIGNsYXNzPVwibWVudS1pdGVtIGxpLWxvZ28taG9sZGVyXCI+PGRpdiBjbGFzcz1cIm1lbnUtaXRlbS1saW5rXCI+PC9kaXY+PC9saT4nKS5pbnNlcnRBZnRlcihuYXZpZ2F0aW9uTGkuZmlsdGVyKCc6ZXEoJyArIG1pZGRsZSArICcpJykpO1xuICAgICAgICAgICAgICAgICQoJy5zaXRlLWxvZ28nKS5jbG9uZSgpLmFwcGVuZFRvKCcubGktbG9nby1ob2xkZXInKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pZiBpdHMgbm90IGluIHRoZSBtaWRkbGUgYnV0IGl0IHdhcy4gbW92ZSBpdCBvdXRcbiAgICAgICAgICAgIGlmICh0byAhPSAnbG9nby1pbi1taWRkbGUnICYmICQoJy5saS1sb2dvLWhvbGRlcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICQoJy5saS1sb2dvLWhvbGRlcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cbi8vdG9kbyByZW1vdmU/XG4gICAgLy8gV2hldGhlciBhIGhlYWRlciBpbWFnZSBpcyBhdmFpbGFibGUuXG4gICAgZnVuY3Rpb24gaGFzSGVhZGVySW1hZ2UoKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IHdwLmN1c3RvbWl6ZSgnaGVhZGVyX2ltYWdlJykoKTtcbiAgICAgICAgcmV0dXJuICcnICE9PSBpbWFnZSAmJiAncmVtb3ZlLWhlYWRlcicgIT09IGltYWdlO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgYSBoZWFkZXIgdmlkZW8gaXMgYXZhaWxhYmxlLlxuICAgIGZ1bmN0aW9uIGhhc0hlYWRlclZpZGVvKCkge1xuICAgICAgICB2YXIgZXh0ZXJuYWxWaWRlbyA9IHdwLmN1c3RvbWl6ZSgnZXh0ZXJuYWxfaGVhZGVyX3ZpZGVvJykoKSxcbiAgICAgICAgICAgIHZpZGVvID0gd3AuY3VzdG9taXplKCdoZWFkZXJfdmlkZW8nKSgpO1xuXG4gICAgICAgIHJldHVybiAnJyAhPT0gZXh0ZXJuYWxWaWRlbyB8fCAoIDAgIT09IHZpZGVvICYmICcnICE9PSB2aWRlbyApO1xuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBhIGJvZHkgY2xhc3MgaWYgYSBjdXN0b20gaGVhZGVyIGV4aXN0cy5cbiAgICAkLmVhY2goWydleHRlcm5hbF9oZWFkZXJfdmlkZW8nLCAnaGVhZGVyX2ltYWdlJywgJ2hlYWRlcl92aWRlbyddLCBmdW5jdGlvbiAoaW5kZXgsIHNldHRpbmdJZCkge1xuICAgICAgICB3cC5jdXN0b21pemUoc2V0dGluZ0lkLCBmdW5jdGlvbiAoc2V0dGluZykge1xuICAgICAgICAgICAgc2V0dGluZy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzSGVhZGVySW1hZ2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFkZENsYXNzKCdoYXMtaGVhZGVyLWltYWdlJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnaGFzLWhlYWRlci1pbWFnZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghaGFzSGVhZGVyVmlkZW8oKSkge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdoYXMtaGVhZGVyLXZpZGVvJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KShqUXVlcnkpO1xuIl0sImZpbGUiOiJjdXN0b21pemUtcHJldmlldy5qcyJ9