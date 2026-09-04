import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">💍</span>
          </div>
          <span className="font-display font-semibold text-charcoal tracking-tight">
            웨딩 큐시트 메이커
          </span>
        </div>
        <button
          onClick={onStart}
          className="px-4 py-2 bg-lavender text-white rounded-[10px] text-sm font-semibold hover:bg-lavender-light transition-all hover:shadow-md"
        >
          시작하기
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-lavender-pale rounded-full text-lavender text-sm font-semibold mb-8 border border-lavender/20">
          <span>✨</span>
          <span>예식 진행 완벽 준비</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-6 leading-tight">
          정보만 입력하면<br />
          <em className="not-italic text-lavender">식순과 큐시트</em>가<br />
          자동으로 완성됩니다
        </h1>
        <p className="text-muted-text text-lg mb-10 leading-relaxed max-w-lg mx-auto">
          신랑신부가 기본 정보를 입력하면, 사회자용 시간표 큐시트와
          멘트 스크립트가 분위기에 맞게 자동 생성됩니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-lavender text-white rounded-[14px] text-base font-bold hover:bg-lavender-light transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
          >
            내 식순 만들기 →
          </button>
          <p className="text-muted-text text-sm">무료 · 가입 없이 이용 가능</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '✏️',
              title: '간편 입력',
              desc: '예식 정보와 인물만 입력하면 끝. 복잡한 설정 없이 10분 완성.',
              color: 'bg-lavender-pale',
            },
            {
              icon: '🎭',
              title: '분위기 맞춤 멘트',
              desc: '밝고 경쾌하게, 따뜻하게 등 4가지 톤으로 전체 멘트가 한번에 바뀝니다.',
              color: 'bg-sage-pale',
            },
            {
              icon: '📋',
              title: '바로 인쇄 가능',
              desc: '완성된 큐시트는 PDF로 저장하거나 이메일로 사회자에게 바로 전송하세요.',
              color: 'bg-rose-pale',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-surface rounded-[14px] border border-border p-6 hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <div className={`w-12 h-12 ${f.color} rounded-[12px] flex items-center justify-center mb-4 text-2xl`}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-charcoal mb-2">{f.title}</h3>
              <p className="text-muted-text text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border py-16 px-6 mb-0">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-charcoal text-center mb-12">
            이렇게 사용하세요
          </h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: '01', title: '기본 정보 입력', desc: '날짜, 장소, 이름, 분위기를 입력하세요', emoji: '📝' },
              { step: '02', title: '식순 편집', desc: '순서를 드래그해서 원하는 대로 조정하세요', emoji: '🔄' },
              { step: '03', title: '분위기 선택', desc: '멘트 톤을 선택하면 전체가 즉시 바뀝니다', emoji: '🎨' },
              { step: '04', title: '인쇄 / 전송', desc: 'PDF로 저장하거나 이메일로 전송하세요', emoji: '🖨️' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+24px)] right-[-24px] h-px bg-border" />
                )}
                <div className="w-10 h-10 bg-lavender-pale rounded-full flex items-center justify-center mx-auto mb-3 border border-lavender/20 relative z-10">
                  <span className="text-lg">{s.emoji}</span>
                </div>
                <span className="block text-[10px] text-lavender font-bold tracking-widest mb-1">STEP {s.step}</span>
                <h4 className="font-semibold text-charcoal text-sm mb-1">{s.title}</h4>
                <p className="text-muted-text text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-lavender-muted py-16 text-center px-6">
        <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
          지금 바로 시작해보세요
        </h2>
        <p className="text-muted-text mb-8 text-sm">준비 시간 10분, 완성도 100%</p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-lavender text-white rounded-[14px] text-base font-bold hover:bg-lavender-light transition-all hover:shadow-lg"
        >
          내 식순 만들기 →
        </button>
      </section>
    </div>
  )
}
