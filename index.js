const btns = document.querySelectorAll('button')
const form = document.querySelector('form')
const formAct = document.querySelector('form span')
const input = document.querySelector('input')
const error = document.querySelector('.error')

let activity = 'cycling'

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    // get activity
    activity = e.target.dataset.activity

    // remove and add active class
    btns.forEach(btn => btn.classList.remove('active'))

    e.target.classList.add('active')

    // set ID of input field
    input.setAttribute('id', activity)

    // set text of form span
    formAct.textContent = activity

    // call the update function
    update(data)
  })
})


// form submit

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const distance = parseInt(input.value)

  if (distance)
    db.collection('activities').add({
      distance,
      activity,
      date: new Date().toString()
    }).then(() => {
      error.textContent = ""
      form.reset()
    })
  else error.textContent = "Please enter a valid distance"
})
