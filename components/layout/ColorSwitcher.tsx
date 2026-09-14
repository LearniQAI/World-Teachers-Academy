export default function ColorSwitcher() {
  return (
    <div className="color-scheme-wrap active">
        <button className="switchIcon"><i className="fa-solid fa-palette"></i></button>
        <h3 className="color-scheme-wrap-title text-center">Color Switcher</h3>
        <h4 className="color-scheme-wrap-subtitle text-center">Theme Color</h4>
        <div className="color-switch-btns">
            <button data-color="#1CB098"><i className="fa-solid fa-droplet"></i></button>
            <button data-color="#1882FF"><i className="fa-solid fa-droplet"></i></button>
            <button data-color="#743EF9"><i className="fa-solid fa-droplet"></i></button>
            <button data-color="#FF5C2A"><i className="fa-solid fa-droplet"></i></button>
            <button data-color="#FE5A86"><i className="fa-solid fa-droplet"></i></button>
        </div>
        <h4 className="color-scheme-wrap-subtitle mt-20 text-center">Secondary Color</h4>
        <div className="secondary-color-switch-btns">
            <button data-secondary-color="#FFBF00"><i className="fa-solid fa-droplet"></i></button>
            <button data-secondary-color="#50C878"><i className="fa-solid fa-droplet"></i></button>
            <button data-secondary-color="#E01717"><i className="fa-solid fa-droplet"></i></button>
            <button data-secondary-color="#00BFFF"><i className="fa-solid fa-droplet"></i></button>
            <button data-secondary-color="#4169E1"><i className="fa-solid fa-droplet"></i></button>
        </div>
    </div>
  );
}
