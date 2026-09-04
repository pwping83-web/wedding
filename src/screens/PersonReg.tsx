import { useEffect, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import ChipSelectWithCustom, {
  isChipValueValid,
  resolveChipValue,
} from '../components/mobile/ChipSelectWithCustom'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, Person, PersonRole, SetData } from '../data'
import { FIXED_MC, getPersonIntroScript, roleLabels, withFixedMc } from '../data'
import { buildIntroGeneratePayload, requestGeneratedScript } from '../lib/generateScript'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const RELS = ['고등학교 동창', '대학교 동창', '직장 동료', '군대 전우', '친구', '가족', '외부']

const ADDABLE_ROLES: PersonRole[] = ['vocalist', 'speaker']

export default function PersonReg({ data, setData, onNext, onBack }: Props) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<PersonRole>('vocalist')
  const [relationshipPreset, setRelationshipPreset] = useState('')
  const [customRelationship, setCustomRelationship] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    setData((prev) => {
      const nextPersons = withFixedMc(prev.persons)
      if (nextPersons.length === prev.persons.length) return prev
      return { ...prev, persons: nextPersons }
    })
  }, [setData])

  const mcPerson = data.persons.find((person) => person.role === 'mc') ?? FIXED_MC
  const guestPersons = data.persons.filter((person) => person.role !== 'mc')

  const relationship = resolveChipValue(relationshipPreset, customRelationship)
  const canAdd = name.trim() && isChipValueValid(relationshipPreset, customRelationship)

  const addPerson = () => {
    if (!canAdd) return
    const person: Person = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      relationship,
      introVariant: 0,
    }
    setData((prev) => ({ ...prev, persons: withFixedMc([...prev.persons, person]) }))
    setName('')
    setRelationshipPreset('')
    setCustomRelationship('')
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
        persons: withFixedMc(
          prev.persons.map((p) => (p.id === id ? { ...p, customIntro: script } : p)),
        ),
      }))
    } catch {
      setData((prev) => ({
        ...prev,
        persons: withFixedMc(
          prev.persons.map((p) =>
            p.id === id ? { ...p, introVariant: p.introVariant + 1, customIntro: undefined } : p,
          ),
        ),
      }))
    } finally {
      setGenerating(null)
    }
  }

  const renderPersonCard = (person: Person, removable: boolean) => (
    <Card key={person.id} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-[15px]">{person.name}</p>
          <p className="text-[12px] text-muted-text">
            {roleLabels[person.role]} · {person.relationship}
          </p>
        </div>
        {removable && (
          <button
            type="button"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                persons: withFixedMc(prev.persons.filter((p) => p.id !== person.id)),
              }))
            }
            className="text-muted-text"
          >
            ×
          </button>
        )}
      </div>
      {person.role !== 'mc' && (
        <>
          <p className="text-[13px] text-charcoal leading-relaxed mb-2">
            {getPersonIntroScript(person)}
          </p>
          <button
            type="button"
            onClick={() => generateIntro(person.id)}
            disabled={generating === person.id}
            className="text-[12px] text-accent font-medium"
          >
            {generating === person.id ? 'AI 생성 중…' : 'AI 멘트 생성'}
          </button>
        </>
      )}
    </Card>
  )

  return (
    <ScreenLayout
      step={4}
      stepLabel="인물"
      title="인물 등록"
      subtitle="사회자 박건 · 축가/축사 등 추가 (선택)"
      onBack={onBack}
      footer={
        <div className="space-y-2">
          <Btn onClick={onNext}>다음</Btn>
          <Btn variant="ghost" onClick={onNext}>
            건너뛰기
          </Btn>
        </div>
      }
    >
      <div className="mb-4">{renderPersonCard(mcPerson, false)}</div>

      <Card className="p-4 space-y-4 mb-4">
        <Field label="이름" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <p className="text-[13px] font-medium text-charcoal mb-2">역할</p>
          <div className="flex flex-wrap gap-2">
            {ADDABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border ${
                  role === r
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-surface text-muted-text border-border'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>
        <ChipSelectWithCustom
          label="신랑/신부와의 관계"
          options={RELS}
          value={relationshipPreset}
          onChange={setRelationshipPreset}
          customValue={customRelationship}
          onCustomChange={setCustomRelationship}
          customPlaceholder="관계를 입력하세요 (예: 대학원 동기, 사촌)"
          hint="목록에 없으면 직접 입력을 선택하세요"
        />
        <Btn onClick={addPerson} disabled={!canAdd}>
          추가
        </Btn>
      </Card>

      {guestPersons.length === 0 ? (
        <p className="text-center text-[14px] text-muted-text py-4">추가 인물이 없습니다</p>
      ) : (
        <div className="space-y-3">{guestPersons.map((person) => renderPersonCard(person, true))}</div>
      )}
    </ScreenLayout>
  )
}
