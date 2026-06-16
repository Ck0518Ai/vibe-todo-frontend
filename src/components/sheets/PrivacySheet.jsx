import { useApp } from '../../context/AppContext';

export default function PrivacySheet() {
  const { privacySheetOpen, setPrivacySheetOpen, categoryFormDraft, setCategoryFormDraft } = useApp();

  if (!privacySheetOpen) return null;

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPrivacySheetOpen(false); }}>
      <div className="sheet">
        <h3 className="sheet__title">공개설정</h3>
        <button
          type="button"
          className="sheet-option"
          onClick={() => {
            setCategoryFormDraft({ ...categoryFormDraft, isPrivate: true });
            setPrivacySheetOpen(false);
          }}
        >
          🔒 나만 보기
        </button>
        <button
          type="button"
          className="sheet-option"
          onClick={() => {
            setCategoryFormDraft({ ...categoryFormDraft, isPrivate: false });
            setPrivacySheetOpen(false);
          }}
        >
          🌐 전체 공개
        </button>
      </div>
    </div>
  );
}
