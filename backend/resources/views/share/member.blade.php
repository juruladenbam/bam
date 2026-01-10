<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="{{ $title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ $image }}" />
    <meta property="og:url" content="{{ $url }}" />
    <meta property="og:type" content="profile" />

    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $image }}">

    <title>{{ $title }}</title>

    <script>
        // Redirect to the actual portal page
        window.location.href = "{{ $url }}";
    </script>
</head>
<body>
    <p>Mengalihkan ke <a href="{{ $url }}">{{ $title }}</a>...</p>
</body>
</html>
