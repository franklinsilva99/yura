import { Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Disclaimer from '../components/Disclaimer'
import ErrorText from '../components/ErrorText'
import Spinner from '../components/Spinner'
import { today } from '../lib/dates'
import { friendlyError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Wellbeing as WellbeingT } from '../lib/types'
import { needsSupport } from '../lib/wellbeing'
import SupportCard from './wellbeing/SupportCard'
import TodayCheckIn from './wellbeing/TodayCheckIn'
import WeeklyChart from './wellbeing/WeeklyChart'

const DISMISS_KEY = 'yura:support-dismissed'

export default function Wellbeing() {
  const [recent, setRecent] = useState<WellbeingT[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    let active = true
    supabase
      .from('wellbeing')
      .select('*')
      .order('day', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(friendlyError(error))
        setRecent((data as WellbeingT[]) ?? [])
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  if (recent === null) return <Spinner />
  const todayEntry = recent.find((w) => w.day === today()) ?? null

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-semibold">Mi bienestar</h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-sm">
          <Lock size={14} aria-hidden /> Solo tú puedes ver esto
        </p>
      </header>
      <ErrorText>{error}</ErrorText>
      {!dismissed && needsSupport(recent) && <SupportCard onDismiss={dismiss} />}
      <TodayCheckIn entry={todayEntry} onSaved={() => setRefreshKey((k) => k + 1)} />
      <WeeklyChart refreshKey={refreshKey} />
      <Disclaimer />
    </div>
  )
}
