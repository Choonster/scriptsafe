(function (t) {
  t.fn.stickyScroll = function (o) {
    var e = {
      /**
       * @param {StickyScrollOptions} o
       * @this {JQuery<unknown>}
       */
      init: function (o) {
        function e() {
          return (
            t(document).height() -
            i.container.offset().top -
            i.container.attr('offsetHeight')
          );
        }
        function s() {
          return i.container.offset().top;
        }
        function n(o) {
          return Number(t(o).attr('offsetHeight'));
        }
        var i;
        return (
          'auto' !== o.mode &&
            'manual' !== o.mode &&
            (o.container && (o.mode = 'auto'),
            o.bottomBoundary && (o.mode = 'manual')),
          (i = t.extend(
            {
              mode: 'auto',
              container: t('body'),
              topBoundary: null,
              bottomBoundary: null,
            },
            o,
          )),
          (i.container = t(i.container)),
          i.container.length
            ? ('auto' === i.mode &&
                ((i.topBoundary = s()), (i.bottomBoundary = e())),
              this.each(function (o) {
                var c = t(this),
                  a = t(window),
                  r = Date.now() + o,
                  l = n(c);
                (c.data('sticky-id', r),
                  a.bind('scroll.stickyscroll-' + r, function () {
                    var o = t(document).scrollTop(),
                      e = t(document).height() - o - l;
                    e <= i.bottomBoundary
                      ? c
                          .offset({
                            top: t(document).height() - i.bottomBoundary - l,
                          })
                          .removeClass('sticky-active')
                          .removeClass('sticky-inactive')
                          .addClass('sticky-stopped')
                      : o > i.topBoundary
                        ? c
                            .offset({ top: t(window).scrollTop() })
                            .removeClass('sticky-stopped')
                            .removeClass('sticky-inactive')
                            .addClass('sticky-active')
                        : o < i.topBoundary &&
                          c
                            .css({ position: '', top: '', bottom: '' })
                            .removeClass('sticky-stopped')
                            .removeClass('sticky-active')
                            .addClass('sticky-inactive');
                  }),
                  a.bind('resize.stickyscroll-' + r, function () {
                    ('auto' === i.mode &&
                      ((i.topBoundary = s()), (i.bottomBoundary = e())),
                      (l = n(c)),
                      t(this).scroll());
                  }),
                  c.addClass('sticky-processed'),
                  a.scroll());
              }))
            : void (
                console &&
                console.log(
                  'StickyScroll: the element ' +
                    o.container +
                    " does not exist, we're throwing in the towel",
                )
              )
        );
      },
      reset: function () {
        return this.each(function () {
          var o = t(this),
            e = o.data('sticky-id');
          (o
            .css({ position: '', top: '', bottom: '' })
            .removeClass('sticky-stopped')
            .removeClass('sticky-active')
            .removeClass('sticky-inactive')
            .removeClass('sticky-processed'),
            t(window).unbind('.stickyscroll-' + e));
        });
      },
    };
    return e[o]
      ? e[o].apply(this, Array.prototype.slice.call(arguments, 1))
      : 'object' != typeof o && o
        ? void (
            console &&
            console.log('Method' + o + ' does not exist on jQuery.stickyScroll')
          )
        : e.init.apply(this, arguments);
  };
})(jQuery);
