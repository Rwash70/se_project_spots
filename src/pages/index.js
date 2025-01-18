import "../pages/index.css";

import {
  enableValidation,
  validationConfig,
  resetValidation,
  disabledButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "01d95ca5-7b68-46aa-ad10-9050ea08b9f5",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, getUserInfo]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardslist.append(cardElement);
    });
    // Handle the user's information
    const { avatar, name, about } = getUserInfo;
    profileAvatar.src = avatar;
    profileName.textContent = name;
    profileDescription.textContent = about;
  })
  .catch(console.error);

// Profile form elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileAvatar = document.querySelector(".profile__avatar");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDesriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardFormElement = cardModal.querySelector(".modal__form");
const cardSaveBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector(".modal__form");
const avatarSaveBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close_icon-btn");
const deleteModalCancelBtn = deleteForm.querySelector(".modal__cancel-btn");

// Preview image popup elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseEl = previewModal.querySelector(".modal__close-btn");

// Card related elements
const cardTemplate = document.querySelector("#card-template");
const cardslist = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  // Select elements within the card
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikedBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  // set card details
  cardNameEl.textContent = data.name;
  console.log(data);
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Handle like button click
  cardLikedBtn.addEventListener("click", (evt) =>
    handleLike(evt, data._id, data.isLiked)
  );
  if (data.isLiked) {
    cardLikedBtn.classList.add("card__like-button_liked");
  }

  // Handle delete button click
  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  // Handle image preview modals
  cardImageEl.addEventListener("click", () => {
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleClickOverlay(evt) {
  if (evt.target.classList.contains("modal_opened")) {
    closeModal(evt.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keyup", handleEscClose);
  document.addEventListener("click", handleClickOverlay);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keyup", handleEscClose);
  document.removeEventListener("click", handleClickOverlay);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const activeModal = document.querySelector(".modal_opened");
    closeModal(activeModal);
  }
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDesriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  cardSaveBtn.textContent = "Submitting...";

  api
    .addCard(inputValues)
    .then((data) => {
      const cardElement = getCardElement(data);
      cardslist.prepend(cardElement);
      closeModal(cardModal);
      disabledButton(cardSaveBtn, validationConfig);
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      cardSaveBtn.textContent = "Save";
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      cardSaveBtn.textContent = "Save";
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardID) {
  selectedCard = cardElement;
  selectedCardId = cardID;
  openModal(deleteModal);
}

function handleLike(evt, id, isLiked) {
  // const isLiked = evt.target.classList.contains("card__like-button_liked");

  api
    .handleLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDesriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDesriptionInput],
    validationConfig
  );

  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseEl.addEventListener("click", () => {
  closeModal(previewModal);
});

// add your logic for closing the confirmation modal when the x icon is clicked.
deleteModalCloseBtn.addEventListener("click", () => {
  console.log("is this firing");
  closeModal(deleteModal);
});
// for your cancel button in your confirmation modal, add an event listener that will close the modal when the cancel button is clicked
deleteModalCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleCardFormSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarFormElement.addEventListener("submit", handleAvatarSubmit);

enableValidation(validationConfig);
