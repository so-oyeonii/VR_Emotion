import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Questionnaire.css';

// AAQ-II (Acceptance and Action Questionnaire - II)
// 7-point Likert scale: 1(전혀 그렇지 않다) ~ 7(항상 그렇다)
const AAQ_ITEMS = [
  '나의 고통스러운 경험과 기억들이 나를 충실하게 살지 못하게 한다.',
  '나는 나의 감정을 두려워한다.',
  '나의 걱정거리가 앞길을 가로막을까 봐 걱정된다.',
  '나의 고통스러운 기억들이 내가 충만한 삶을 살지 못하게 한다.',
  '감정이 나의 삶에 문제를 일으킨다.',
  '대부분의 사람들은 나보다 자기 삶을 잘 꾸려나가는 것 같다.',
  '걱정거리가 나의 성공을 방해한다.',
];

const SCALE_LABELS = [
  '전혀\n그렇지\n않다',
  '거의\n그렇지\n않다',
  '가끔\n그렇다',
  '보통\n이다',
  '자주\n그렇다',
  '거의\n항상\n그렇다',
  '항상\n그렇다',
];

function AAQ() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const [responses, setResponses] = useState(Array(AAQ_ITEMS.length).fill(null));

  if (!userData.userId) {
    navigate('/');
    return null;
  }

  const handleResponse = (itemIndex, value) => {
    const newResponses = [...responses];
    newResponses[itemIndex] = value;
    setResponses(newResponses);
  };

  const allAnswered = responses.every((r) => r !== null);

  const handleNext = () => {
    if (!allAnswered) return;
    // AAQ-II 결과를 스토어에 저장
    useStore.getState().setAAQResponses(responses);
    setScreen(2);
    navigate('/panas');
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-panel">
        <div className="questionnaire-header">
          <h1>감정 회피 성향 설문</h1>
          <p className="questionnaire-desc">
            아래의 각 문항을 읽고, 자신에게 해당하는 정도를 선택해 주세요.
          </p>
        </div>

        <div className="scale-legend">
          {SCALE_LABELS.map((label, i) => (
            <div key={i} className="scale-legend-item">
              <span className="scale-num">{i + 1}</span>
              <span className="scale-text">{label}</span>
            </div>
          ))}
        </div>

        <div className="questions-list">
          {AAQ_ITEMS.map((item, idx) => (
            <div key={idx} className={`question-card ${responses[idx] !== null ? 'answered' : ''}`}>
              <div className="question-number">{idx + 1}</div>
              <p className="question-text">{item}</p>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                  <button
                    key={val}
                    className={`likert-btn ${responses[idx] === val ? 'selected' : ''}`}
                    onClick={() => handleResponse(idx, val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="questionnaire-footer">
          <div className="progress-text">
            {responses.filter((r) => r !== null).length} / {AAQ_ITEMS.length} 응답 완료
          </div>
          <button
            className="next-button"
            onClick={handleNext}
            disabled={!allAnswered}
          >
            {allAnswered ? '다음으로' : `${responses.filter((r) => r !== null).length}/${AAQ_ITEMS.length} 응답 필요`}
          </button>
        </div>

        <div className="progress-indicator">
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default AAQ;
