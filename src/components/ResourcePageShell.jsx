import React, { forwardRef } from 'react';
import MinimalHeader from './MinimalHeader';
import ResourceNav from './ResourceNav';

const MAX_WIDTH_CLASS = {
    '3xl': 'max-w-none sm:max-w-3xl',
    '4xl': 'max-w-none sm:max-w-4xl',
    '5xl': 'max-w-none sm:max-w-5xl',
    '7xl': 'max-w-none sm:max-w-7xl',
    none: 'max-w-none',
};

/**
 * Shared layout for Studio resource pages: full-bleed on small screens, safe-area insets,
 * consistent header + ResourceNav, touch-friendly main padding.
 *
 * @param {object} props
 * @param {string} props.navTitle — passed to ResourceNav
 * @param {React.ReactNode} props.children — main column content
 * @param {'3xl'|'4xl'|'5xl'|'7xl'|'none'} [props.maxWidth='3xl']
 * @param {string} [props.mainClassName] — extra classes on <main>
 * @param {string} [props.rootClassName] — extra classes on outer wrapper (e.g. relative, for GSAP)
 * @param {string} [props.contentClassName] — extra classes on the block under the fixed header
 * @param {React.ReactNode} [props.footer] — rendered after main (e.g. site footer)
 */
const ResourcePageShell = forwardRef(function ResourcePageShell(
    { navTitle, children, maxWidth = '3xl', mainClassName = '', rootClassName = '', contentClassName = '', footer = null },
    ref
) {
    const maxCls = MAX_WIDTH_CLASS[maxWidth] || MAX_WIDTH_CLASS['3xl'];
    return (
        <div ref={ref} className={`resource-page-root flex flex-col ${rootClassName}`.trim()}>
            <MinimalHeader />
            <div className={`resource-content-offset flex flex-col flex-1 min-h-0 min-w-0 ${contentClassName}`.trim()}>
                <ResourceNav title={navTitle} />
                <main className={`resource-main ${maxCls} ${mainClassName}`.trim()}>{children}</main>
            </div>
            {footer}
        </div>
    );
});

ResourcePageShell.displayName = 'ResourcePageShell';

export default ResourcePageShell;
