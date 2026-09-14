export default function Preloader() {
  return (
    <div className="preloader ">
        <button className="th-btn preloaderCls">CANCEL PRELOADER </button>
        <div className="preloader-inner">
            <div className="bounce mb-4">
                <img src="/assets/img/logo-icon.svg" alt="img" />
            </div>
            <span className="loader">
                Escul
                <span className="loading-text">Escul</span>
            </span>
        </div>
    </div>
  );
}
