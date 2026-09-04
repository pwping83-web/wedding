import { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, Person, PersonRole, SetData } from '../data'
import { roleLabels, getPersonIntroScript } from '../data'
import { buildIntroGeneratePayload, requestGeneratedScript } from '../lib/generateScript'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const COMMON_RELATIONSHIPS = ['고등학교 동창', '대학교 동창', '직장 동료', '군대 전우', '친구', '가족']

const ROLE_COLORS: Record<PersonRole, string> = {
  mc: 'bg-lavender-pale text-lavender',
  officiant: 'bg-sage-pale text-sage',
  vocalist: 'bg-rose-pale text-rose',
  speaker: 'bg-muted-bg text-muted-text',
}

export default function PersonReg({ data, setData, onNext, onBack }: Props) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<PersonRole>('speaker')
  const [relationship, setRelationship] = useState('')
  const [customRel, setCustomRel] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)

  const effectiveRel = relationship === 'custom' ? customRel : relationship

  const addPerson = () => {
    if (!name.trim() || !effectiveRel.trim()) return
    const person: Person = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      relationship: effectiveRel,
      introVariant: 0,
    }
    setData((prev) => ({ ...prev, persons: [...prev.persons, person] }))
    setName('')
    setRelationship('')
    setCustomRel('')
  }

  const removePerson = (id: string) => {
    setData((prev) => ({ ...prev, persons: prev.persons.filter((p) => p.id !== id) }))
  }

  const generateIntro = async (id: string) => {
    const person = data.persons.find((p) => p.id === id)
    if (!person) return

    setGenerating(id)
    try {
      const script = await requestGeneratedScript(
        buildIntroGeneratePayload(data, person.relationship, getPersonIntroScript(person)),
      )
      setData((prev) => ({
        ...prev,
        persons: prev.persons.map((p) =>
          p.id === id ? { ...p, customIntro: script } : p,
        ),
      }))
    } catch {
      setData((prev) => ({
        ...prev,
        persons: prev.persons.map((p) =>
          p.id === id
            ? { ...p, introVariant: p.introVariant + 1, customIntro: undefined }
            : p,
        ),
      }))
    } finally {
      setGenerating(null)
    }
  }

  const canAdd = name.trim() && effectiveRel.trim()

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={4} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">인물 등록</h1>
          <p className="text-muted-text text-sm">사회자, 축가자, 축사자를 등록하세요</p>
        </div>

        {/* Add form */}
        <div className="bg-surface rounded-[13px] border border-border p-5 mb-6">
          <h3 className="font-semibold text-charcoal text-sm mb-4">새 인물 추가</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-text mb-1.5">이름</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted-bg border border-border rounded-[10px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text mb-1.5">역할</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as PersonRole)}
                  className="w-full px-3 py-2.5 bg-muted-bg border border-border rounded-[10px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender transition-all appearance-none cursor-pointer"
                >
                  {(Object.keys(roleLabels) as PersonRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabels[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text mb-2">
                신랑/신부와의 관계
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => { setRelationship(rel); setCustomRel('') }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      relationship === rel
                        ? 'bg-lavender text-white'
                        : 'bg-muted-bg text-muted-text hover:bg-lavender-pale hover:text-lavender'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
                <button
                  onClick={() => setRelationship('custom')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    relationship === 'custom'
                      ? 'bg-lavender text-white'
                      : 'bg-muted-bg text-muted-text hover:bg-lavender-pale hover:text-lavender'
                  }`}
                >
                  직접 입력
                </button>
              </div>
              {relationship === 'custom' && (
                <input
                  type="text"
                  placeholder="관계를 입력하세요 (예: 대학원 동기)"
                  value={customRel}
                  onChange={(e) => setCustomRel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted-bg border border-border rounded-[10px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender transition-all"
                />
              )}
            </div>

            <button
              onClick={addPerson}
              disabled={!canAdd}
              className="w-full py-3 bg-lavender text-white rounded-[10px] text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lavender-light transition-all"
            >
              등록하기
            </button>
          </div>
        </div>

        {/* Person cards */}
        {data.persons.length === 0 ? (
          <div className="text-center py-12 text-muted-text">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-medium">등록된 인물이 없습니다</p>
            <p className="text-xs mt-1 text-muted-text/70">위 양식으로 인물을 추가해 주세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.persons.map((person) => {
              const intro = getPersonIntroScript(person)
              const isGen = generating === person.id
              return (
                <div key={person.id} className="bg-surface rounded-[13px] border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal">{person.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${ROLE_COLORS[person.role]}`}>
                          {roleLabels[person.role]}
                        </span>
                      </div>
                      <span className="text-muted-text text-xs mt-0.5 block">{person.relationship}</span>
                    </div>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="text-muted-text/40 hover:text-rose transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Intro script */}
                  <div className="bg-lavender-pale rounded-[10px] px-4 py-3 mb-3 border border-lavender/15">
                    <p
                      className={`text-charcoal text-sm leading-relaxed transition-opacity duration-300 ${
                        isGen ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      {intro}
                    </p>
                  </div>

                  <button
                    onClick={() => generateIntro(person.id)}
                    disabled={isGen}
                    className="flex items-center gap-1.5 text-xs text-lavender hover:text-lavender-light transition-colors disabled:opacity-60 group"
                  >
                    <span
                      className={`text-base transition-transform duration-500 ${
                        isGen ? 'animate-spin' : 'group-hover:rotate-180'
                      }`}
                    >
                      ↻
                    </span>
                    <span>{isGen ? 'AI 생성 중...' : 'AI 멘트 생성하기'}</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={onNext}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            다음 단계 →
          </button>
          <button
            onClick={onNext}
            className="w-full py-2.5 text-muted-text text-sm hover:text-charcoal transition-colors"
          >
            이 단계 건너뛰기
          </button>
        </div>
      </div>
    </div>
  )
}
