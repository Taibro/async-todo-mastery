import {useState} from 'react';
import { bulkAction } from '../api/todoApi';
import ProgressBar from './ProgressBar';

function BulkAction({todos, selectedIds, onSelectionChange, onComplete}){
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        setIsProcessing(true);
        setProgress(0);

        const total = selectedIds.length;
        let completed = 0;

        const promises = selectedIds.map(async (id) => {
            try{
                await import('../api/todoApi').then(m => m.deleteTodo(id));
                completed++;
                setProgress(Math.round((completed / total) * 100));
            }catch(err){
                console.error(`Failed to delete ${id}:`, err);
            }
        });

        await Promise.all(promises);

        setIsProcessing(false);
        onComplete();
    };

    return (
        <div className="bulk-actions">
            <p>{selectedIds.length} items duoc chon</p>

            <label>
                <input
                    type="checkbox"
                    checked={selectedIds.length === todos.length && todos.length > 0}
                    onChange={(e) => {
                        if (e.target.checked){
                            onSelectionChange(todos.map(t => t.id));
                        }else{
                            onSelectionChange([]);
                        }
                    }}
                />
                Chon tat ca
            </label>

            <button
                onClick={handleBulkDelete}
                disabled={isProcessing || selectedIds.length === 0}
            >
                {isProcessing ? 'Dang xoa' : 'Xoa da chon'}
            </button>

            {isProcessing && (
                <ProgressBar progress={progress} label={`Dang xoa: ${progress}`}/>
            )}
        </div>
    );
}

export default BulkAction;