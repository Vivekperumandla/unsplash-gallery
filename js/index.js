let currentIndex = 0;
let images = [];

$(document).ready(function () {
  fetchImages();

  $(document).on("click", ".close", function () {
    $("#image-modal").hide();
  });
});

// Fetch images from Unsplash API
function fetchImages() {
  const API_URL = "https://api.unsplash.com/photos";
  const ACCESS_KEY = "0zPLcHZKuweLiBIA6eXjNfVoeXwvjwCEEnE5reBEak4";

  $("#loading").show();

  $.ajax({
    url: API_URL,
    type: "GET",
    data: {
      client_id: ACCESS_KEY,
      per_page: 30,
    },
    success: function (response) {
      displayImages(response);
      $("#loading").hide();
    },
    error: function () {
      $("#loading").hide();
      console.error("Error fetching images");
    },
  });
}

// Display images in the gallery
function displayImages(imageArray) {
  images = imageArray;
  const $gallery = $("#gallery");
  $gallery.empty();

  let imagesLoaded = 0;
  const totalImages = imageArray.length;

  imageArray.forEach((image, index) => {
    // Create an image container element
    const $imgContainer = $("<div>", { class: "img-container" });
    const $img = $("<img>", {
      src: image.urls.small,
      alt: image.alt_description,
      "data-id": image.id,
      "data-index": index,
      "data-details": JSON.stringify(image),
      class: "gallery-item",
    });

    const $overlay = $("<div>", { class: "overlay" });
    const $profileImg = $("<img>", {
      src: image.user.profile_image.small,
      alt: `${image.user.name}'s profile picture`,
      class: "profile-pic",
    });
    const $userName = $("<span>", {
      text: image.user.name,
      class: "user-name",
    });

    $overlay.append($profileImg).append($userName);
    $imgContainer.append($img).append($overlay);
    $gallery.append($imgContainer);

    $img.on("load", function () {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        adjustOverlays();
      }
    });
  });

  setupImageClickEvent();
}

// Setup click event handlers for images and overlays
function setupImageClickEvent() {
  $(".gallery-item, .overlay").on("click", function () {
    currentIndex = $(this)
      .closest(".img-container")
      .find(".gallery-item")
      .data("index");
    const imageDetails = JSON.parse(
      $(this)
        .closest(".img-container")
        .find(".gallery-item")
        .attr("data-details")
    );
    openModal(imageDetails, currentIndex);
  });
}

// Adjust overlay position based on image height
function adjustOverlays() {
  $(".img-container").each(function () {
    const $img = $(this).find("img");
    const $overlay = $(this).find(".overlay");

    if ($img.height() < 300) {
      $overlay.css({
        bottom: "7%",
        height: "93%",
      });
    }
  });
}

// Open modal with image details
function openModal(imageDetails, index) {
  currentIndex = index;
  $("#modal-image").attr("src", imageDetails.urls.small);
  $("#image-details").html(`
  <h3>${imageDetails.alt_description || "Image Details"}</h3>
  <div>
    <p><strong>Location:</strong> ${imageDetails.user.location || "Unknown"}</p>
    <p><strong>Published on:</strong> ${new Date(
      imageDetails.created_at
    ).toLocaleDateString()}</p>
    <p><strong>Dimensions:</strong> ${imageDetails.width} x ${
    imageDetails.height
  } pixels</p>
    <p><strong>Liked:</strong> ${imageDetails.likes}</p>
    <p><strong>License:</strong> Free to use under the Unsplash License</p>
  </div>
  <p><strong>Photographer:</strong></p>
  <div class="photographer-details">
    <a href="${imageDetails.user.links.html}" target="_blank">
      <img src="${imageDetails.user.profile_image.large}" alt="${
    imageDetails.user.name
  }" class="photographer-profile-image" />
      <span>${imageDetails.user.name}</span>
    </a>
  </div>
  <p><strong>Bio:</strong> ${imageDetails.user.bio || "Hello!"}</p>
  <a href="${imageDetails.urls.full}" target="_blank">View HD Image</a>
    `);
  $("#image-modal").show();
}

$("#prev-button").on("click", function () {
  if (currentIndex > 0) {
    currentIndex--;
    openModal(images[currentIndex], currentIndex);
  }
});

$("#next-button").on("click", function () {
  if (currentIndex < images.length - 1) {
    currentIndex++;
    openModal(images[currentIndex], currentIndex);
  }
});
