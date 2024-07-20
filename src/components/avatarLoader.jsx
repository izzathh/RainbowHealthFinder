import '../assets/css/avatarLoader.css';

const AvatarLoaderComp = ({ isLoadingBack }) => {
    return (
        <div
            style={{
                backgroundColor: isLoadingBack ? '#000' : 'none',
                left: isLoadingBack ? '0' : '35rem'
            }}
            className={`avatar-loader`}
        >
            <div className="loader-inner">
                <div className="loader-line-wrap">
                    <div className="loader-line"></div>
                </div>
                <div className="loader-line-wrap">
                    <div className="loader-line"></div>
                </div>
                <div className="loader-line-wrap">
                    <div className="loader-line"></div>
                </div>
                <div className="loader-line-wrap">
                    <div className="loader-line"></div>
                </div>
                <div className="loader-line-wrap">
                    <div className="loader-line"></div>
                </div>
            </div>
        </div>
    );
};

export default AvatarLoaderComp;