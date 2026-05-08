import { useChaos } from "../context/ChaosContext";

function ChaosToggle(){
    const { chaosEnabled, toggleChaos} = useChaos();

    return (
        <div className={`chaos-toggle ${chaosEnabled ? 'active' : ''}`}>
            <label>
                <input
                    type="checkbox"
                    checked={chaosEnabled}
                    onChange={toggleChaos}
                />
                Chaos Mode {chaosEnabled ? 'ON (3s delay + 20% failure)' : 'OFF'}
            </label>
            {chaosEnabled && (
                <div className="chaos-warning">
                    API sẽ chậm 3 giây và có 20% xác suất thất bại!
                </div>
            )}
        </div>
    );
}

export default ChaosToggle;