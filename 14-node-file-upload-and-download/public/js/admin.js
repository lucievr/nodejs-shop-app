const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article'); // element to be deleted from the DOM

  // we send a background DELETE request, the page does not reload, existing page updated by manipulating the DOM

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrfToken,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productElement.parentNode.removeChild(productElement); // works in every browser
      // productElement.remove(); // remove DOM node, does not work in IE
    })
    .catch((err) => console.log(err));
};
