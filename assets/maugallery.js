(function ($) {
  $.fn.mauGallery = function (options) {
    const settings = $.extend($.fn.mauGallery.defaults, options);
    let tagsCollection = [];

    return this.each(function () {
      const gallery = $(this);
      $.fn.mauGallery.methods.createRowWrapper(gallery);

      if (settings.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          gallery,
          settings.lightboxId,
          settings.navigation
        );
      }

      $.fn.mauGallery.listeners(settings);

      gallery.children(".gallery-item").each(function () {
        const item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem(item);
        $.fn.mauGallery.methods.moveItemInRowWrapper(item);
        $.fn.mauGallery.methods.wrapItemInColumn(item, settings.columns);

        const tag = item.data("gallery-tag");
        if (settings.showTags && tag && !tagsCollection.includes(tag)) {
          tagsCollection.push(tag);
        }
      });

      if (settings.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          gallery,
          settings.tagsPosition,
          tagsCollection
        );
      }

      gallery.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  $.fn.mauGallery.listeners = function (settings) {
    $(".gallery-item").on("click", function () {
      if (settings.lightBox && $(this).is("img")) {
        $.fn.mauGallery.methods.openLightBox($(this), settings.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(settings.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(settings.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      const columnClass =
        columns.constructor === Number
          ? `col-${Math.ceil(12 / columns)}`
          : Object.entries(columns)
              .map(([size, value]) => `col-${size}-${Math.ceil(12 / value)}`)
              .join(" ");
      element.wrap(`<div class='item-column mb-4 ${columnClass}'></div>`);
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.is("img")) {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      const lightbox = $(`#${lightboxId}`);
      lightbox.find(".lightboxImage").attr("src", element.attr("src"));
      lightbox.modal("toggle");
    },

    prevImage(lightboxId) {
      const activeImage = $("img.gallery-item").filter(function () {
        return $(this).attr("src") === $(".lightboxImage").attr("src");
      });

      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = $.fn.mauGallery.methods.getImagesByTag(activeTag);

      const index = imagesCollection.indexOf(activeImage[0]) - 1;
      const previousImage = imagesCollection[index] || imagesCollection[imagesCollection.length - 1];

      $(".lightboxImage").attr("src", $(previousImage).attr("src"));
    },

    nextImage(lightboxId) {
      const activeImage = $("img.gallery-item").filter(function () {
        return $(this).attr("src") === $(".lightboxImage").attr("src");
      });

      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = $.fn.mauGallery.methods.getImagesByTag(activeTag);

      const index = imagesCollection.indexOf(activeImage[0]) + 1;
      const nextImage = imagesCollection[index] || imagesCollection[0];

      $(".lightboxImage").attr("src", $(nextImage).attr("src"));
    },

    getImagesByTag(tag) {
      return tag === "all"
        ? $(".item-column img").toArray()
        : $(".item-column img")
            .filter(function () {
              return $(this).data("gallery-tag") === tag;
            })
            .toArray();
    },

    createLightBox(gallery, lightboxId, navigation) {
      const navButtons = navigation
        ? `
          <div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>
          <div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>
        `
        : '<span style="display:none;"></span>';
      
      gallery.append(`
        <div class="modal fade" id="${lightboxId || "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navButtons}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clic"/>
              </div>
            </div>
          </div>
        </div>
      `);
    },

    showItemTags(gallery, position, tags) {
      const tagItems = tags
        .map(
          (tag) =>
            `<li class="nav-item">
              <span class="nav-link" data-images-toggle="${tag}">${tag}</span>
            </li>`
        )
        .join("");

      const tagRow = `<ul class="my-4 tags-bar nav nav-pills">
        <li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>
        ${tagItems}
      </ul>`;

      if (position === "bottom") {
        gallery.append(tagRow);
      } else if (position === "top") {
        gallery.prepend(tagRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      const tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        const item = $(this);
        item.parents(".item-column").toggle(tag === "all" || item.data("gallery-tag") === tag, 300);
      });
    },
  };
})(jQuery);
