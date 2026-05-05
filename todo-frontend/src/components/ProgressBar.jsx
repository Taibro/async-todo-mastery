function ProgressBar({progress, label}){
    return (
        <div className="progress-container" role="progressbar" aria-valuenow={progress}>
            <div
                className="progress-fill"
                style={{
                    width: `${progress}%`,
                    transition: 'width 1s ease',
                }}
            >
            </div>
            <span className="progress-label">{label}</span>
        </div>
    );
}

export default ProgressBar;