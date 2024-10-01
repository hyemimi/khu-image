import './style.scss'


const upload = document.getElementById("upload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext('2d');

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
})






