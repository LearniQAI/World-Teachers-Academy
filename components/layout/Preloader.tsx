export default function Preloader() {
  return (
    <div className="preloader ">
        <button className="th-btn preloaderCls">CANCEL PRELOADER </button>
        <div className="preloader-inner">
            <div className="bounce mb-4">
                <img src="/assets/img/world-teachers-logo.jpeg" alt="World Teachers Academy" style={{ width: '150px', height: 'auto' }} />
            </div>
            <span className="loader">
                World Teachers Academy
                <span className="loading-text">World Teachers Academy</span>
            </span>
        </div>
    </div>
  );
}
