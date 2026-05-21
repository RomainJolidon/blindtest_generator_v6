export function ExtensionBanner() {
  return (
    <div className="bg-amber-950/50 border border-amber-800 text-amber-200 rounded-lg p-3 text-sm flex items-center gap-3 mb-6">
      <span>⚠️</span>
      <span>
        Make sure the Blindtest V6 Chrome extension is installed and enabled before launching.{' '}
        <a
          href="https://github.com/RomainJolidon/blindtest_generator_v6"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:text-amber-100"
        >
          Get the extension →
        </a>
      </span>
    </div>
  )
}
