import { useApp } from '../../context/AppContext';
import { COLOR_PRESETS } from '../../constants';

export default function ColorSheet() {
  const { colorSheetOpen, setColorSheetOpen, categoryFormDraft, setCategoryFormDraft } = useApp();

  if (!colorSheetOpen) return null;

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) setColorSheetOpen(false); }}>
      <div className="sheet">
        <h3 className="sheet__title">색상 선택</h3>
        <div className="color-grid">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-grid__swatch${color === categoryFormDraft.color ? ' color-grid__swatch--selected' : ''}`}
              style={{ background: color }}
              onClick={() => setCategoryFormDraft({ ...categoryFormDraft, color })}
            />
          ))}
        </div>
        <button type="button" className="btn btn--primary btn--full" onClick={() => setColorSheetOpen(false)}>
          확인
        </button>
      </div>
    </div>
  );
}
