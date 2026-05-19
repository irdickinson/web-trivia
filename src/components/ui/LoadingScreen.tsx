export function LoadingScreen() {
  return (
    <div className="page center">
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '2px solid var(--gold)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}
